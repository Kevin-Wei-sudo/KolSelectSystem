package com.data.creator.api;

import com.data.creator.dto.ApiResponse;
import com.data.creator.services.SchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulerController {

    private final SchedulerService schedulerService;

    @GetMapping("/config")
    public ApiResponse<Map<String, Object>> config() {
        return ApiResponse.ok(schedulerService.config());
    }

    @GetMapping("/presets")
    public ApiResponse<List<Map<String, String>>> presets() {
        return ApiResponse.ok(schedulerService.presets());
    }

    @PostMapping("/enable")
    public ApiResponse<Map<String, Object>> enable(@RequestBody Map<String, String> req) {
        String cron = req.get("cronExpression");
        if (cron == null || cron.isEmpty()) {
            return ApiResponse.fail("cronExpression required");
        }
        try {
            return ApiResponse.ok(schedulerService.enable(cron));
        } catch (Exception e) {
            return ApiResponse.fail("enable failed: " + e.getMessage());
        }
    }

    @PostMapping("/disable")
    public ApiResponse<Map<String, Object>> disable() {
        return ApiResponse.ok(schedulerService.disable());
    }

    @PostMapping("/trigger")
    public ApiResponse<Map<String, Object>> trigger() {
        schedulerService.trigger();
        return ApiResponse.ok(Map.of("message", "triggered"));
    }
}
