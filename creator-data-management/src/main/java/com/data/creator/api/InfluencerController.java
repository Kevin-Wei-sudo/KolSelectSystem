package com.data.creator.api;

import com.data.creator.dto.ApiResponse;
import com.data.creator.dto.CompareRequest;
import com.data.creator.dto.SearchRequest;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import com.data.creator.services.InfluencerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

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
    public ApiResponse<Map<String, Object>> detail(@PathVariable String id) {
        Map<String, Object> data = influencerService.getDetail(id);
        if (data == null) {
            return ApiResponse.fail("达人不存在: " + id);
        }
        return ApiResponse.ok(data);
    }

    @PostMapping("/compare")
    public ApiResponse<Map<String, Object>> compare(@RequestBody CompareRequest req) {
        if (req.getIds() == null || req.getIds().size() < 2 || req.getIds().size() > 5) {
            return ApiResponse.fail("请提供2-5个达人ID进行对比");
        }
        Map<String, Object> data = influencerService.compare(req.getIds());
        return ApiResponse.ok(data);
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
            if (inf.getUpdatedAt() != null) {
                lastUpdate = (lastUpdate == null || inf.getUpdatedAt().isAfter(lastUpdate)) ? inf.getUpdatedAt() : lastUpdate;
            }
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
}