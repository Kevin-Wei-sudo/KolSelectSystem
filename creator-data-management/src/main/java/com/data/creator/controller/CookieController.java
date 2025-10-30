package com.data.creator.controller;

import com.data.creator.dto.ApiResponse;
import com.data.creator.services.CookieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 提供设置/获取 Cookie 的接口，供前端填写使用。
 */
@RestController
@RequestMapping("/api/cookie")
public class CookieController {

    @Autowired
    private CookieService cookieService;

    @GetMapping
    public ApiResponse<String> getCookie() {
        String cookie = cookieService.getCookie();
        return ApiResponse.ok(cookie);
    }

    public static class CookieRequest {
        public String cookie;
        public String getCookie() { return cookie; }
        public void setCookie(String cookie) { this.cookie = cookie; }
    }

    @PostMapping
    public ApiResponse<String> setCookie(@RequestBody CookieRequest req) {
        cookieService.setCookie(req == null ? "" : req.cookie);
        return ApiResponse.ok("updated");
    }
}