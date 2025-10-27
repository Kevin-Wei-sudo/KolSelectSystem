package com.data.creator.controller;

import com.data.creator.dto.ApiResponse;
import com.data.creator.dto.SearchRequest;
import com.data.creator.entities.Influencer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/influencers")
@RequiredArgsConstructor
public class InfluencerController {

    @PostMapping("/search")
    public ApiResponse<List<Influencer>> search(@RequestBody SearchRequest req) {

        return ApiResponse.ok(null);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detail(@PathVariable String id) {
        return ApiResponse.ok(null);
    }

    @PostMapping("/compare")
    public ApiResponse<Map<String, Object>> compare() {
        return ApiResponse.ok(null);
    }

    @GetMapping("/options/filters")
    public ApiResponse<Map<String, Object>> filtersOptions() {
        return ApiResponse.ok(null);
    }

    // 兼容：部分前端可能调用该路径获取概览统计
    @GetMapping("/stats/overview")
    public ApiResponse<Map<String, Object>> statsOverview() {
        return ApiResponse.ok(null);
    }

    // === 新增：预设语句查询接口 ===
    @GetMapping("/search/preset")
    public ApiResponse<List<Influencer>> searchByPreset() {
        return ApiResponse.ok(null);
    }

    // === 新增：返回预设语句列表（用于前端下拉选择） ===
    @GetMapping("/options/preset-phrases")
    public ApiResponse<List<String>> presetPhrases() {
        return ApiResponse.ok(null);
    }
}
