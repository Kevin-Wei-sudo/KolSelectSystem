package com.data.creator.services;

import com.data.creator.dto.SearchRequest;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InfluencerService {
    private final InfluencerRepository influencerRepository;

    // 搜索与分页排序（内存过滤，Demo 版）
    public List<Influencer> search(SearchRequest req) {
        List<Influencer> list = new ArrayList<>();
        influencerRepository.findAll().forEach(list::add);

        // 过滤
        list = list.stream()
                .filter(i -> req.getPlatforms() == null || req.getPlatforms().isEmpty() || (i.getPlatform() != null && req.getPlatforms().contains(i.getPlatform())))
                .filter(i -> req.getCategories() == null || req.getCategories().isEmpty() || (i.getCategory() != null && req.getCategories().contains(i.getCategory())))
                .filter(i -> req.getStyleTags() == null || req.getStyleTags().isEmpty() || (i.getStyleTags() != null && !Collections.disjoint(new HashSet<>(req.getStyleTags()), i.getStyleTags())))
                .filter(i -> req.getGenders() == null || req.getGenders().isEmpty() || (i.getGender() != null && req.getGenders().contains(i.getGender())))
                .filter(i -> req.getPotentialLevels() == null || req.getPotentialLevels().isEmpty() || (i.getPotentialLevel() != null && req.getPotentialLevels().contains(i.getPotentialLevel())))
                .filter(i -> req.getGrowthTrends() == null || req.getGrowthTrends().isEmpty() || (i.getFansGrowthTrend() != null && req.getGrowthTrends().contains(i.getFansGrowthTrend())))
                .filter(i -> req.getFollowersMin() == null || (i.getFollowersCount() != null && i.getFollowersCount() >= req.getFollowersMin()))
                .filter(i -> req.getFollowersMax() == null || (i.getFollowersCount() != null && i.getFollowersCount() <= req.getFollowersMax()))
                .filter(i -> req.getEngagementRateMin() == null || (i.getEngagementRate() != null && i.getEngagementRate().doubleValue() >= req.getEngagementRateMin()))
                .filter(i -> req.getCompletionRateMin() == null || (i.getCompletionRate() != null && i.getCompletionRate().doubleValue() >= req.getCompletionRateMin()))
                // 新增：四维评分过滤
                .filter(i -> req.getAdaptabilityScoreMin() == null || i.getScores() == null || i.getScores().getAdaptability_score() == null || i.getScores().getAdaptability_score() >= req.getAdaptabilityScoreMin())
                .filter(i -> req.getInfluenceScoreMin() == null || i.getScores() == null || i.getScores().getInfluence_score() == null || i.getScores().getInfluence_score() >= req.getInfluenceScoreMin())
                .filter(i -> req.getStickinessScoreMin() == null || i.getScores() == null || i.getScores().getStickiness_score() == null || i.getScores().getStickiness_score() >= req.getStickinessScoreMin())
                .filter(i -> req.getPotentialScoreMin() == null || i.getScores() == null || i.getScores().getPotential_score() == null || i.getScores().getPotential_score() >= req.getPotentialScoreMin())
                .collect(Collectors.toList());

        // 排序
        Comparator<Influencer> comparator = Comparator.comparingLong(i -> Optional.ofNullable(i.getFollowersCount()).orElse(0L));
        String sortBy = Optional.ofNullable(req.getSortBy()).orElse("followers_count");
        switch (sortBy) {
            case "avg_views":
                comparator = Comparator.comparingLong(i -> Optional.ofNullable(i.getAvgViews()).orElse(0L));
                break;
            case "engagement_rate":
                comparator = Comparator.comparingDouble(i -> i.getEngagementRate() == null ? 0.0 : i.getEngagementRate().doubleValue());
                break;
            case "potential_level":
                comparator = Comparator.comparing(i -> Optional.ofNullable(i.getPotentialLevel()).orElse(""));
                break;
            default:
                comparator = Comparator.comparingLong(i -> Optional.ofNullable(i.getFollowersCount()).orElse(0L));
        }
        if ("desc".equalsIgnoreCase(req.getSortOrder())) {
            comparator = comparator.reversed();
        }
        list.sort(comparator);

        // 分页
        int page = Optional.ofNullable(req.getPage()).orElse(1);
        int pageSize = Optional.ofNullable(req.getPageSize()).orElse(20);
        int fromIndex = Math.max(0, (page - 1) * pageSize);
        int toIndex = Math.min(list.size(), fromIndex + pageSize);
        if (fromIndex >= list.size()) {
            return Collections.emptyList();
        }
        return list.subList(fromIndex, toIndex);
    }

    public long count(SearchRequest req) {
        // 简单返回仓库总数；如需严格统计，可复用 search 前的过滤计数
        return influencerRepository.count();
    }

    public long filteredCount(SearchRequest req) {
        List<Influencer> list = new ArrayList<>();
        influencerRepository.findAll().forEach(list::add);
        long c = list.stream()
                .filter(i -> req.getPlatforms() == null || req.getPlatforms().isEmpty() || (i.getPlatform() != null && req.getPlatforms().contains(i.getPlatform())))
                .filter(i -> req.getCategories() == null || req.getCategories().isEmpty() || (i.getCategory() != null && req.getCategories().contains(i.getCategory())))
                .filter(i -> req.getStyleTags() == null || req.getStyleTags().isEmpty() || (i.getStyleTags() != null && !Collections.disjoint(new HashSet<>(req.getStyleTags()), i.getStyleTags())))
                .filter(i -> req.getGenders() == null || req.getGenders().isEmpty() || (i.getGender() != null && req.getGenders().contains(i.getGender())))
                .filter(i -> req.getPotentialLevels() == null || req.getPotentialLevels().isEmpty() || (i.getPotentialLevel() != null && req.getPotentialLevels().contains(i.getPotentialLevel())))
                .filter(i -> req.getGrowthTrends() == null || req.getGrowthTrends().isEmpty() || (i.getFansGrowthTrend() != null && req.getGrowthTrends().contains(i.getFansGrowthTrend())))
                .filter(i -> req.getFollowersMin() == null || (i.getFollowersCount() != null && i.getFollowersCount() >= req.getFollowersMin()))
                .filter(i -> req.getFollowersMax() == null || (i.getFollowersCount() != null && i.getFollowersCount() <= req.getFollowersMax()))
                .filter(i -> req.getEngagementRateMin() == null || (i.getEngagementRate() != null && i.getEngagementRate().doubleValue() >= req.getEngagementRateMin()))
                .filter(i -> req.getCompletionRateMin() == null || (i.getCompletionRate() != null && i.getCompletionRate().doubleValue() >= req.getCompletionRateMin()))
                // 新增：四维评分过滤
                .filter(i -> req.getAdaptabilityScoreMin() == null || i.getScores() == null || i.getScores().getAdaptability_score() == null || i.getScores().getAdaptability_score() >= req.getAdaptabilityScoreMin())
                .filter(i -> req.getInfluenceScoreMin() == null || i.getScores() == null || i.getScores().getInfluence_score() == null || i.getScores().getInfluence_score() >= req.getInfluenceScoreMin())
                .filter(i -> req.getStickinessScoreMin() == null || i.getScores() == null || i.getScores().getStickiness_score() == null || i.getScores().getStickiness_score() >= req.getStickinessScoreMin())
                .filter(i -> req.getPotentialScoreMin() == null || i.getScores() == null || i.getScores().getPotential_score() == null || i.getScores().getPotential_score() >= req.getPotentialScoreMin())
                .count();
        return c;
    }

    // 详情：返回合并后的 Map，包含趋势数据
    public Map<String, Object> getDetail(String id) {
        Optional<Influencer> opt = influencerRepository.findById(id);
        if (!opt.isPresent()) return null;
        Influencer i = opt.get();
        Map<String, Object> map = new LinkedHashMap<>();
        // 基础数据（蛇形键）
        map.put("id", i.getId());
        map.put("name", i.getName());
        map.put("avatar", i.getAvatar());
        map.put("platform", i.getPlatform());
        map.put("category", i.getCategory());
        map.put("gender", i.getGender());
        map.put("age_range", i.getAgeRange());
        map.put("location", i.getLocation());
        map.put("verified", i.getVerified());
        map.put("mcn", i.getMcn());
        map.put("followers_count", i.getFollowersCount());
        map.put("avg_views", i.getAvgViews());
        map.put("engagement_rate", i.getEngagementRate());
        map.put("completion_rate", i.getCompletionRate());
        map.put("publish_frequency_30d", i.getPublishFrequency30d());
        map.put("publish_frequency_90d", i.getPublishFrequency90d());
        map.put("explosive_content_count", i.getExplosiveContentCount());
        map.put("fans_growth_trend", i.getFansGrowthTrend());
        map.put("scores", i.getScores());
        map.put("potential_level", i.getPotentialLevel());
        map.put("price_min", i.getPriceMin());
        map.put("price_max", i.getPriceMax());
        map.put("price_range", i.getPriceRange());
        map.put("contact", i.getContact());
        map.put("recent_works", i.getRecentWorks());
        map.put("cooperation_history", i.getCooperationHistory());
        map.put("cooperation_reputation", i.getCooperationReputation());
        map.put("prediction_reasons", i.getPredictionReasons());
        map.put("tags", i.getTags());
        map.put("fans_profile", i.getFansProfile());
        // 生成趋势（30天）
        map.put("followers_trend", generateTrendLong(i.getFollowersCount(), 30, 0.01));
        map.put("views_trend", generateTrendLong(i.getAvgViews(), 30, 0.05));
        return map;
    }

    public Map<String, Object> compare(List<String> ids) {
        List<Influencer> influencers = new ArrayList<>();
        influencerRepository.findAll().forEach(influencers::add);
        Map<String, Influencer> byId = influencers.stream().collect(Collectors.toMap(Influencer::getId, x -> x));
        List<Influencer> selected = ids.stream().map(byId::get).filter(Objects::nonNull).collect(Collectors.toList());
        // 简单 AI 分析（Demo）：基于互动率和完播率给出建议
        List<Map<String, Object>> analysis = new ArrayList<>();
        for (Influencer i : selected) {
            double er = i.getEngagementRate() == null ? 0.0 : i.getEngagementRate().doubleValue();
            double cr = i.getCompletionRate() == null ? 0.0 : i.getCompletionRate().doubleValue();
            List<String> strengths = new ArrayList<>();
            List<String> weaknesses = new ArrayList<>();
            if (er >= 70) strengths.add("互动率优秀"); else if (er > 0) strengths.add("互动率良好"); else weaknesses.add("互动率缺失");
            if (cr >= 60) strengths.add("完播率较高"); else weaknesses.add("完播率偏低");
            String rec = er >= 70 ? "适合新品预热与爆款打造" : "适合常规推广与口碑建立";
            Map<String, Object> a = new LinkedHashMap<>();
            a.put("influencer_name", i.getName());
            a.put("strengths", strengths);
            a.put("weaknesses", weaknesses);
            a.put("recommendation", rec);
            analysis.add(a);
        }
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("influencers", selected);
        resp.put("analysis", analysis);
        return resp;
    }

    public Map<String, Object> filtersOptions() {
        Set<String> platforms = new LinkedHashSet<>();
        Set<String> categories = new LinkedHashSet<>();
        Set<String> styleTags = new LinkedHashSet<>();
        Set<String> genders = new LinkedHashSet<>();
        Set<String> potentialLevels = new LinkedHashSet<>();
        Set<String> growthTrends = new LinkedHashSet<>();
        influencerRepository.findAll().forEach(i -> {
            if (i.getPlatform() != null) platforms.add(i.getPlatform());
            if (i.getCategory() != null) categories.add(i.getCategory());
            if (i.getStyleTags() != null) styleTags.addAll(i.getStyleTags());
            if (i.getGender() != null) genders.add(i.getGender());
            if (i.getPotentialLevel() != null) potentialLevels.add(i.getPotentialLevel());
            if (i.getFansGrowthTrend() != null) growthTrends.add(i.getFansGrowthTrend());
        });
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("platforms", platforms);
        data.put("categories", categories);
        data.put("styleTags", styleTags);
        data.put("genders", genders);
        data.put("potentialLevels", potentialLevels);
        data.put("growthTrends", growthTrends);
        return data;
    }

    private List<Long> generateTrendLong(Long base, int days, double fluct) {
        List<Long> trend = new ArrayList<>();
        long b = base == null ? 1000L : base;
        Random r = new Random(Objects.hash(base, days));
        for (int i = 0; i < days; i++) {
            double factor = 1 + (r.nextDouble() * 2 - 1) * fluct; // ±fluct
            long v = Math.max(0, Math.round(b * factor));
            trend.add(v);
            // 轻微漂移
            b = Math.round(b * (1 + (r.nextDouble() - 0.5) * fluct * 0.2));
        }
        return trend;
    }
}
