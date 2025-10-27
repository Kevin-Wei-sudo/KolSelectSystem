package com.data.creator.douyin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import javax.net.ssl.HttpsURLConnection;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class DouyinGetUserVideoService {
    
    private static final String USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static String cookie;
    private static String msToken = "";



    @SneakyThrows
    public void getUserVideo(String secUserId) {

        cookie = Files.readString(Paths.get("cookie.txt"), StandardCharsets.UTF_8).trim();
        msToken = getCookie("msToken");

        fetchUserPosts(secUserId);

    }

    /**
     * 抓取指定 sec_user_id 的视频列表 (分页)
     */
    public static void fetchUserPosts(String secUserId) {
        try {
            long maxCursor = 0;
            boolean hasMore = true;
            int page = 1;

            while (hasMore) {
                // 构造 URL
                String api = String.format(
                        "https://www.douyin.com/aweme/v1/web/aweme/post/?device_platform=webapp" +
                                "&aid=6383" +
                                "&channel=channel_pc_web" +
                                "&sec_user_id=%s" +
                                "&max_cursor=%d" +
                                "&locate_query=false" +
                                "&show_live_replay_strategy=1" +
                                "&need_time_list=1" +
                                "&time_list_query=0" +
                                "&whale_cut_token=" +
                                "&cut_version=1" +
                                "&count=18" +
                                "&publish_video_strategy_type=2" +
                                "&from_user_page=1" +
                                "&update_version_code=170400" +
                                "&pc_client_type=1" +
                                "&support_h265=1" +
                                "&support_dash=1" +
                                "&cpu_core_num=10" +
                                "&version_code=290100" +
                                "&version_name=29.1.0" +
                                "&cookie_enabled=true" +
                                "&screen_width=2560" +
                                "&screen_height=1440" +
                                "&browser_language=zh-CN" +
                                "&browser_platform=MacIntel" +
                                "&browser_name=Chrome" +
                                "&browser_version=141.0.0.0" +
                                "&browser_online=true" +
                                "&engine_name=Blink" +
                                "&engine_version=141.0.0.0" +
                                "&os_name=Mac+OS" +
                                "&os_version=10.15.7" +
                                "&device_memory=8" +
                                "&platform=PC" +
                                "&downlink=10" +
                                "&effective_type=4g" +
                                "&round_trip_time=50" +
                                "&webid=7547635831361373706" +
                                "&msToken=%s",
                        URLEncoder.encode(secUserId, StandardCharsets.UTF_8),
                        maxCursor,
                        URLEncoder.encode(msToken, StandardCharsets.UTF_8)
                );

                System.out.println("请求第 " + page + " 页数据...");
                String response = httpGet(api);
                String fileName = "douyin_user_posts_page_" + page + ".json";
                Files.writeString(Paths.get(fileName), response, StandardCharsets.UTF_8);
                System.out.println("✅ 已保存文件: " + fileName);

                // 解析 JSON
                JsonNode root = MAPPER.readTree(response);
                JsonNode awemeList = root.path("aweme_list");
                if (awemeList.isArray()) {
                    System.out.println("本页视频数: " + awemeList.size());
                    for (JsonNode v : awemeList) {
                        String desc = v.path("desc").asText();
                        long diggCount = v.path("statistics").path("digg_count").asLong();
                        System.out.println(" - " + desc + " ❤️ " + diggCount);
                    }
                }

                hasMore = root.path("has_more").asBoolean(false);
                maxCursor = root.path("max_cursor").asLong(0);
                System.out.println("has_more=" + hasMore + " next_cursor=" + maxCursor);
                page++;

                // 防风控延时
                Thread.sleep(1000 + (long) (Math.random() * 2000));
            }

            System.out.println("✅ 全部抓取完成。");

        } catch (Exception e) {
            System.err.println("fetchUserPosts 出错: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 简单 GET 方法
     */
    private static String httpGet(String urlStr) throws IOException {
        URL url = new URL(urlStr);
        HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", USER_AGENT);
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("Referer", "https://www.douyin.com/");
        conn.setRequestProperty("Cookie", cookie);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(20000);

        int code = conn.getResponseCode();
        InputStream in = (code >= 200 && code < 300) ? conn.getInputStream() : conn.getErrorStream();
        String body = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        in.close();
        conn.disconnect();

        System.out.println("HTTP " + code + " | 返回 " + body.length() + " 字节");
        return body;
    }

    private static String getCookie(String cname) {
        String name = cname + "=";
        String[] parts = cookie.split(";");
        for (String c : parts) {
            c = c.trim();
            if (c.startsWith(name)) {
                return c.substring(name.length());
            }
        }
        return "";
    }
}
