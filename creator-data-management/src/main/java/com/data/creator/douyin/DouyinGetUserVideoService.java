package com.data.creator.douyin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.net.ssl.HttpsURLConnection;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@Service
public class DouyinGetUserVideoService {
    
    private static final String USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static String cookie;
    private static String msToken = "";



    @SneakyThrows
    public JsonNode getUserVideo(String secUserId, int pageLimit) {
        cookie = Files.readString(Paths.get("cookie.txt"), StandardCharsets.UTF_8).trim();
        msToken = getCookie("msToken");

        final int maxPages = (pageLimit <= 0) ? Integer.MAX_VALUE : pageLimit;

        long maxCursor = 0L;
        boolean hasMore = true;
        int page = 1;

        // 装“每一页的完整响应 JSON”
        var pages = MAPPER.createArrayNode();

        while (hasMore && page <= maxPages) {
            String api = String.format(
                    "https://www.douyin.com/aweme/v1/web/aweme/post/?device_platform=webapp" +
                            "&aid=6383&channel=channel_pc_web&sec_user_id=%s&max_cursor=%d" +
                            "&locate_query=false&show_live_replay_strategy=1&need_time_list=1&time_list_query=0" +
                            "&whale_cut_token=&cut_version=1&count=18&publish_video_strategy_type=2&from_user_page=1" +
                            "&update_version_code=170400&pc_client_type=1&support_h265=1&support_dash=1&cpu_core_num=10" +
                            "&version_code=290100&version_name=29.1.0&cookie_enabled=true&screen_width=2560&screen_height=1440" +
                            "&browser_language=zh-CN&browser_platform=MacIntel&browser_name=Chrome&browser_version=141.0.0.0" +
                            "&browser_online=true&engine_name=Blink&engine_version=141.0.0.0&os_name=Mac+OS&os_version=10.15.7" +
                            "&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=7547635831361373706" +
                            "&msToken=%s",
                    URLEncoder.encode(secUserId, StandardCharsets.UTF_8),
                    maxCursor,
                    URLEncoder.encode(msToken, StandardCharsets.UTF_8)
            );

            String response = httpGet(api);
            JsonNode root = MAPPER.readTree(response);

            // 直接把“整页的 root JSON”放进数组，不做任何提取或改写
            pages.add(root);

            hasMore = root.path("has_more").asBoolean(false);
            maxCursor = root.path("max_cursor").asLong(0);
            page++;

            try { Thread.sleep(1000 + (long)(Math.random()*2000)); } catch (InterruptedException ignored) {}
        }

        // 返回“每一页完整 JSON”的数组
        return pages;
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
