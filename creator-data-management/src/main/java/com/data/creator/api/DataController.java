package com.data.creator.api;

import com.data.creator.dto.ApiResponse;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import com.data.creator.services.DataImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataController {

    private final InfluencerRepository influencerRepository;
    private final DataImportService dataImportService;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
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

    @PostMapping("/reload")
    public ApiResponse<Map<String, Object>> reload() {
        int total = dataImportService.reloadFromResources();
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("lastUpdate", OffsetDateTime.now());
        return ApiResponse.ok(result);
    }
}