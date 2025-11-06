package com.data.creator.services;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 管理爬虫使用的 Cookie：
 * - 启动时尝试从项目根目录的 cookie.txt 载入（若存在）；
 * - 提供 API 设置/获取 Cookie；
 * - 设置时同时写回到 cookie.txt，确保重启后仍可使用。
 */
@Service
public class CookieService {
    private volatile String cookie = null;
    private static final Path COOKIE_PATH = Paths.get("cookie.txt");

    public synchronized void setCookie(String cookie) {
        this.cookie = cookie == null ? "" : cookie.trim();
        // 持久化到文件，方便重启后继续使用
        try {
            Files.writeString(COOKIE_PATH, this.cookie, StandardCharsets.UTF_8);
        } catch (Exception ignored) {
            // 写文件失败不影响服务运行
        }
    }

    public synchronized String getCookie() {
        if (cookie == null || cookie.isEmpty()) {
            // 尝试从文件加载
            try {
                if (Files.exists(COOKIE_PATH)) {
                    cookie = Files.readString(COOKIE_PATH, StandardCharsets.UTF_8).trim();
                } else {
                    cookie = "";
                }
            } catch (Exception e) {
                cookie = "";
            }
        }
        return cookie;
    }
}