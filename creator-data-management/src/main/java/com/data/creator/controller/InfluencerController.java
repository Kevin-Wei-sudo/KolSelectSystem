package com.data.creator.controller;

import com.data.creator.dto.ApiResponse;
import com.data.creator.dto.CompareRequest;
import com.data.creator.dto.InfluencerDetailDTO;
import com.data.creator.dto.SearchRequest;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import com.data.creator.services.InfluencerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/influencers")
@RequiredArgsConstructor
public class InfluencerController {

    private final InfluencerService influencerService;
    private final InfluencerRepository influencerRepository;

    @PostMapping("/search")
    public ApiResponse<List<Influencer>> search(@RequestBody SearchRequest req) {
        List<Influencer> result = influencerService.search(req);
        long total = influencerService.filteredCount(req);
        return ApiResponse.ok(result, total);
    }

    @GetMapping("/{id}")
    public ApiResponse<InfluencerDetailDTO> detail(@PathVariable String id) {
        InfluencerDetailDTO data = influencerService.getDetail(id);
        return ApiResponse.ok(data);
    }

    @PostMapping("/compare")
    public ApiResponse<Map<String, Object>> compare(@RequestBody CompareRequest req) {
        if (req.getIds() == null || req.getIds().size() != 2) {
            return ApiResponse.fail("请提供2个达人ID进行对比");
        }
        return ApiResponse.ok(influencerService.compare(req.getIds()));
    }

    @GetMapping("/options/filters")
    public ApiResponse<Map<String, Object>> filtersOptions() {
        Map<String, Object> data = influencerService.filtersOptions();
        return ApiResponse.ok(data);
    }

    // 兼容：部分前端可能调用该路径获取概览统计
    @GetMapping("/stats/overview")
    public ApiResponse<Map<String, Object>> statsOverview() {
        long total = influencerRepository.count();
        Iterable<Influencer> all = influencerRepository.findAll();
        long highPotential = 0;
        long followersSum = 0;
        long followersCountNonNull = 0;
        Map<String, Long> platformStats = new LinkedHashMap<>();
        OffsetDateTime lastUpdate = null;
        for (Influencer inf : all) {
            if (inf.getPotentialLevel() != null && inf.getPotentialLevel().startsWith("S")) {
                highPotential++;
            }
            if (inf.getFollowersCount() != null) {
                followersSum += inf.getFollowersCount();
                followersCountNonNull++;
            }
            String platform = inf.getPlatform() == null ? "未知" : inf.getPlatform();
            platformStats.put(platform, platformStats.getOrDefault(platform, 0L) + 1);
//            if (inf.getUpdatedAt() != null) {
//                lastUpdate = (lastUpdate == null || inf.getUpdatedAt().isAfter(lastUpdate)) ? inf.getUpdatedAt() : lastUpdate;
//            }
        }
        long avgFollowers = followersCountNonNull > 0 ? Math.round((double) followersSum / followersCountNonNull) : 0L;
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("total", total);
        data.put("highPotentialCount", highPotential);
        data.put("avgFollowers", avgFollowers);
        data.put("platformStats", platformStats);
        data.put("lastUpdate", lastUpdate != null ? lastUpdate : OffsetDateTime.now());
        return ApiResponse.ok(data);
    }

    // === 新增：预设语句查询接口 ===
    @GetMapping("/search/preset")
    public ApiResponse<List<Influencer>> searchByPreset(
            @RequestParam("phrase") String phrase,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize
    ) {
        if (phrase == null || phrase.trim().isEmpty()) {
            return ApiResponse.fail("请输入预设语句");
        }
        int p = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(p, pageSize);
        Page<Influencer> resultPage = influencerService.searchByPresetPhrase(phrase, pageable);
        return ApiResponse.ok(resultPage.getContent(), resultPage.getTotalElements());
    }

    // === 新增：返回预设语句列表（用于前端下拉选择） ===
    @GetMapping("/options/preset-phrases")
    public ApiResponse<List<String>> presetPhrases() {
        List<String> phrases = influencerService.getPresetPhrases();
        return ApiResponse.ok(phrases);
    }
}
