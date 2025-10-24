package com.data.creator.api;

import com.data.creator.dto.ApiResponse;
import com.data.creator.services.CrawlerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {

    private final CrawlerService crawlerService;

    @PostMapping("/start")
    public ApiResponse<Map<String, Object>> start() {
        crawlerService.start();
        return ApiResponse.ok(Map.of("message", "crawler started"));
    }

    @PostMapping("/stop")
    public ApiResponse<Map<String, Object>> stop() {
        crawlerService.stop();
        return ApiResponse.ok(Map.of("message", "crawler stopped"));
    }

    @PostMapping("/reset")
    public ApiResponse<Map<String, Object>> reset() {
        crawlerService.reset();
        return ApiResponse.ok(Map.of("message", "crawler reset"));
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        return ApiResponse.ok(crawlerService.status());
    }
}
