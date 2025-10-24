package com.data.creator.controller;

import com.data.creator.dto.ApiResponse;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import com.data.creator.repositories.SchedulerConfigRepository;
import com.data.creator.services.DataImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
public class DataController {

    private final InfluencerRepository influencerRepository;
    private final SchedulerConfigRepository schedulerConfigRepository;
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

    @PostMapping("/reset-demo")
    @Transactional
    public ApiResponse<Map<String, Object>> resetDemo() {
        log.info("开始重置Demo数据...");
        
        try {
            // 检查删除前的数据量
            long influencerCountBefore = influencerRepository.count();
            long schedulerCountBefore = schedulerConfigRepository.count();
            log.info("删除前数据量 - 达人: {}, 定时任务: {}", influencerCountBefore, schedulerCountBefore);
            
            // 清空所有数据表
            influencerRepository.deleteAll();
            log.info("执行达人数据表删除操作");
            
            schedulerConfigRepository.deleteAll();
            log.info("执行定时任务配置表删除操作");
            
            // 强制刷新到数据库
            influencerRepository.flush();
            schedulerConfigRepository.flush();
            
            // 检查删除后的数据量
            long influencerCountAfter = influencerRepository.count();
            long schedulerCountAfter = schedulerConfigRepository.count();
            log.info("删除后数据量 - 达人: {}, 定时任务: {}", influencerCountAfter, schedulerCountAfter);
            
            // 重新加载初始数据（不需要再次清空，因为上面已经清空了）
//            int total = dataImportService.reloadFromResources(false);
//            log.info("已重新加载 {} 条达人数据", total);
            
            // 最终检查数据量
            long finalCount = influencerRepository.count();
            log.info("最终数据量: {}", finalCount);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Demo数据重置成功");
//            result.put("total", total);
            result.put("resetTime", OffsetDateTime.now());
            result.put("beforeDelete", Map.of("influencer", influencerCountBefore, "scheduler", schedulerCountBefore));
            result.put("afterDelete", Map.of("influencer", influencerCountAfter, "scheduler", schedulerCountAfter));
            result.put("finalCount", finalCount);
            result.put("clearedTables", List.of("sys_influencer", "sys_influencer_style_tags", "sys_influencer_prediction_reasons", "scheduler_config"));
            
            return ApiResponse.ok(result);
        } catch (Exception e) {
            log.error("重置Demo数据失败", e);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "重置失败: " + e.getMessage());
            return ApiResponse.fail("重置Demo数据失败");
        }
    }

    @GetMapping("/test-db")
    public ApiResponse<Map<String, Object>> testDatabase() {
        try {
            long influencerCount = influencerRepository.count();
            long schedulerCount = schedulerConfigRepository.count();
            
            Map<String, Object> result = new HashMap<>();
            result.put("influencerCount", influencerCount);
            result.put("schedulerCount", schedulerCount);
            result.put("timestamp", OffsetDateTime.now());
            
            log.info("数据库测试 - 达人数量: {}, 定时任务数量: {}", influencerCount, schedulerCount);
            
            return ApiResponse.ok(result);
        } catch (Exception e) {
            log.error("数据库测试失败", e);
            return ApiResponse.fail("数据库连接失败: " + e.getMessage());
        }
    }
}
