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
public class DouyinGetUserInfoService {

    private static final String USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static String cookie;
    private static String msToken;

    @SneakyThrows
    public JsonNode getUserInfo(String secUserId) {
        cookie = Files.readString(Paths.get("cookie.txt"), StandardCharsets.UTF_8).trim();
        msToken = getCookie("msToken");               // 从 cookie 拿实时 msToken
        String sVWebId = getCookie("s_v_web_id");     // 建议用于 verifyFp/fp

        // 1) 先拼不含 a_bogus 的完整 URL（注意 msToken/verifyFp/fp 都用实时值）
        String base = "https://www.douyin.com/aweme/v1/web/user/profile/other/";
        String fullUrl = String.format(
                "%s?device_platform=webapp" +
                        "&aid=6383" +
                        "&channel=channel_pc_web" +
                        "&source=channel_pc_web" +
                        "&publish_video_strategy_type=2" +
                        "&sec_user_id=%s" +
                        "&cookie_enabled=true" +
                        "&msToken=%s",
                base,
                URLEncoder.encode(secUserId, StandardCharsets.UTF_8),
                URLEncoder.encode(msToken, StandardCharsets.UTF_8)
        );
        String json = fetchUserInfo(fullUrl);
        //System.out.println(json);
        return MAPPER.readTree(json);

    }

    /**
     * 拉取用户信息：给完整 URL，返回原始 JSON 字符串
     */
    public static String fetchUserInfo(String fullUrl) {
        try {
            log.info("请求用户信息...");
            String response = httpGet(fullUrl);
            log.info("✅ 用户信息获取完成。");
            return response; // 原样返回完整 JSON
        } catch (Exception e) {
            log.error("fetchUserInfo 出错: {}", e.getMessage());
            //e.printStackTrace();
            return "";
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

        log.info("HTTP {} | 返回 {} 字节", code, body.length());
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
