package com.data.creator.controller;

import com.data.creator.dto.ApiResponse;
import com.data.creator.services.CrawlerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {

    private final CrawlerService crawlerService;

    @PostMapping("/start")
    public ApiResponse<?> start() {
        try {
            crawlerService.start();
            return ApiResponse.ok("爬虫启动成功");
        } catch (Exception e) {
            log.error("启动爬虫失败", e);
            return ApiResponse.fail("启动失败: " + e.getMessage());
        }
    }

    @PostMapping("/stop")
    public ApiResponse<?> stop() {
        try {
            crawlerService.stop();
            return ApiResponse.ok("爬虫停止成功");
        } catch (Exception e) {
            log.error("停止爬虫失败", e);
            return ApiResponse.fail("停止失败: " + e.getMessage());
        }
    }

    @PostMapping("/reset")
    public ApiResponse<?> reset() {
        try {
            crawlerService.reset();
            return ApiResponse.ok("爬虫重置成功");
        } catch (Exception e) {
            log.error("重置爬虫失败", e);
            return ApiResponse.fail("重置失败: " + e.getMessage());
        }
    }

    @GetMapping("/status")
    public ApiResponse<CrawlerService.CrawlerStatus> getStatus() {
        try {
            CrawlerService.CrawlerStatus status = crawlerService.getStatus();
            return ApiResponse.ok(status);
        } catch (Exception e) {
            log.error("获取爬虫状态失败", e);
            return ApiResponse.fail("获取状态失败: " + e.getMessage());
        }
    }
}
