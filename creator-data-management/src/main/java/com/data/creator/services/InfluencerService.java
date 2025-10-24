package com.data.creator.services;

import com.data.creator.dto.InfluencerDTO;
import com.data.creator.dto.SearchRequest;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
                // 平台
                .filter(i -> req.getPlatform() == null || req.getPlatform().isEmpty()
                        || (i.getPlatform() != null && req.getPlatform().contains(i.getPlatform())))

                // 分类
                .filter(i -> req.getCategory() == null || req.getCategory().isEmpty()
                        || (i.getCategory() != null && !Collections.disjoint(new HashSet<>(req.getCategory()), i.getCategory())))

                // 风格标签（求交集）
                .filter(i -> req.getStyleTag() == null || req.getStyleTag().isEmpty()
                        || (i.getStyleTags() != null && !Collections.disjoint(new HashSet<>(req.getStyleTag()), i.getStyleTags())))

                // 性别
                .filter(i -> req.getGender() == null || req.getGender().isEmpty()
                        || (i.getGender() != null && req.getGender().contains(i.getGender())))

                // 潜力等级
                .filter(i -> req.getPotentialLevel() == null || req.getPotentialLevel().isEmpty()
                        || (i.getPotentialLevel() != null && req.getPotentialLevel().contains(i.getPotentialLevel())))

                // 粉丝增长趋势
                .filter(i -> req.getFansGrowthTrend() == null || req.getFansGrowthTrend().isEmpty()
                        || (i.getFansGrowthTrend() != null && req.getFansGrowthTrend().contains(i.getFansGrowthTrend())))

                // 粉丝数量范围
                .filter(i -> req.getFollowersMin() == null
                        || (i.getFollowersCount() != null && i.getFollowersCount() >= req.getFollowersMin()))
                .filter(i -> req.getFollowersMax() == null
                        || (i.getFollowersCount() != null && i.getFollowersCount() <= req.getFollowersMax()))
                // 互动率
                .filter(i -> {
                    if (req.getEngagementRateMin() == null) return true;
                    if (i.getEngagementRate() == null) return false;
                    return i.getEngagementRate().compareTo(BigDecimal.valueOf(req.getEngagementRateMin())) >= 0;
                })
                // 完播率
                .filter(i -> {
                    if (req.getCompletionRateMin() == null) return true;
                    if (i.getCompletionRate() == null) return false;
                    return i.getCompletionRate().compareTo(BigDecimal.valueOf(req.getCompletionRateMin())) >= 0;
                })
                // 四维评分过滤（仅当 scores 不为 null 时才判断）
                .filter(i -> {
                    if (i.getScores() == null) return true;
                    return req.getAdaptabilityScoreMin() == null
                            || (i.getScores().getAdaptability_score() != null
                            && i.getScores().getAdaptability_score() >= req.getAdaptabilityScoreMin());
                })
                .filter(i -> {
                    if (i.getScores() == null) return true;
                    return req.getInfluenceScoreMin() == null
                            || (i.getScores().getInfluence_score() != null
                            && i.getScores().getInfluence_score() >= req.getInfluenceScoreMin());
                })
                .filter(i -> {
                    if (i.getScores() == null) return true;
                    return req.getStickinessScoreMin() == null
                            || (i.getScores().getStickiness_score() != null
                            && i.getScores().getStickiness_score() >= req.getStickinessScoreMin());
                })
                .filter(i -> {
                    if (i.getScores() == null) return true;
                    return req.getPotentialScoreMin() == null
                            || (i.getScores().getPotential_score() != null
                            && i.getScores().getPotential_score() >= req.getPotentialScoreMin());
                })
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
        // 拉取所有达人数据（如是 Demo，可接受；生产建议用 Specification 查询）
        List<Influencer> list = influencerRepository.findAll();

        return list.stream()
                // 平台筛选
                .filter(i -> req.getPlatform() == null || req.getPlatform().isEmpty()
                        || (i.getPlatform() != null && req.getPlatform().contains(i.getPlatform())))

                // 分类筛选
                .filter(i -> req.getCategory() == null || req.getCategory().isEmpty()
                        || (i.getCategory() != null && !Collections.disjoint(new HashSet<>(req.getCategory()), i.getCategory())))

                // 风格标签筛选（求交集）
                .filter(i -> req.getStyleTag() == null || req.getStyleTag().isEmpty()
                        || (i.getStyleTags() != null && !Collections.disjoint(new HashSet<>(req.getStyleTag()), i.getStyleTags())))

                // 性别筛选
                .filter(i -> req.getGender() == null || req.getGender().isEmpty()
                        || (i.getGender() != null && req.getGender().contains(i.getGender())))

                // 潜力等级筛选
                .filter(i -> req.getPotentialLevel() == null || req.getPotentialLevel().isEmpty()
                        || (i.getPotentialLevel() != null && req.getPotentialLevel().contains(i.getPotentialLevel())))

                // 粉丝增长趋势
                .filter(i -> req.getFansGrowthTrend() == null || req.getFansGrowthTrend().isEmpty()
                        || (i.getFansGrowthTrend() != null && req.getFansGrowthTrend().contains(i.getFansGrowthTrend())))

                // 粉丝区间
                .filter(i -> req.getFollowersMin() == null
                        || (i.getFollowersCount() != null && i.getFollowersCount() >= req.getFollowersMin()))
                .filter(i -> req.getFollowersMax() == null
                        || (i.getFollowersCount() != null && i.getFollowersCount() <= req.getFollowersMax()))
                // 互动率
                .filter(i -> {
                    if (req.getEngagementRateMin() == null) return true;
                    if (i.getEngagementRate() == null) return false;
                    return i.getEngagementRate().compareTo(BigDecimal.valueOf(req.getEngagementRateMin())) >= 0;
                })
                // 完播率
                .filter(i -> {
                    if (req.getCompletionRateMin() == null) return true;
                    if (i.getCompletionRate() == null) return false;
                    return i.getCompletionRate().compareTo(BigDecimal.valueOf(req.getCompletionRateMin())) >= 0;
                })
                // 四维评分过滤（防止空指针 + 条件正确）
                .filter(i -> {
                    if (req.getAdaptabilityScoreMin() == null) return true;
                    return i.getScores() != null
                            && i.getScores().getAdaptability_score() != null
                            && i.getScores().getAdaptability_score() >= req.getAdaptabilityScoreMin();
                })
                .filter(i -> {
                    if (req.getInfluenceScoreMin() == null) return true;
                    return i.getScores() != null
                            && i.getScores().getInfluence_score() != null
                            && i.getScores().getInfluence_score() >= req.getInfluenceScoreMin();
                })
                .filter(i -> {
                    if (req.getStickinessScoreMin() == null) return true;
                    return i.getScores() != null
                            && i.getScores().getStickiness_score() != null
                            && i.getScores().getStickiness_score() >= req.getStickinessScoreMin();
                })
                .filter(i -> {
                    if (req.getPotentialScoreMin() == null) return true;
                    return i.getScores() != null
                            && i.getScores().getPotential_score() != null
                            && i.getScores().getPotential_score() >= req.getPotentialScoreMin();
                })

                .count();
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
            if (er >= 70) strengths.add("互动率优秀");
            else if (er > 0) strengths.add("互动率良好");
            else weaknesses.add("互动率缺失");
            if (cr >= 60) strengths.add("完播率较高");
            else weaknesses.add("完播率偏低");
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
            if (i.getCategory() != null) categories.addAll(i.getCategory());
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










    // --------------- 预设语句常量 ---------------
    public static final List<String> PRESET_PHRASES = List.of(
            "帮我找10个小红书美妆类的女性达人，粉丝在10-50万，互动率要高",
            "找一些抖音美食类的达人，爆款潜力高，粉丝在上升期",
            "推荐几个B站数码类的达人，专业风格，粉丝50万以上",
            "找快手搞笑类达人，性价比高，口碑好",
            "小红书时尚类达人，粉丝20-100万，完播率高",
            "抖音旅游类达人，爆款潜力S级或A级，女性",
            "找一些母婴类达人，亲民风格，商单口碑好",
            "运动健身类达人，男性，粉丝在增长中"
    );


//    public List<InfluencerDTO> searchByPresetPhrase(String phrase) {
//        List<Influencer> filtered = switch (phrase.trim()) {
//            case "帮我找10个小红书美妆类的女性达人，粉丝在10-50万，互动率要高" ->
//                    influencerRepository.queryXhsBeautyFemaleHighEngagementTop10();
//            case "找一些抖音美食类的达人，爆款潜力高，粉丝在上升期" ->
//                    influencerRepository.queryDouyinFoodHighPotentialRisingTop20();
//            case "推荐几个B站数码类的达人，专业风格，粉丝50万以上" ->
//                    influencerRepository.queryBiliDigitalProfessionalFollowersOver500KTop5();
//            case "找快手搞笑类达人，性价比高，口碑好" ->
//                    influencerRepository.queryKuaishouComedyCostEffectiveGoodReputationTop20();
//            case "小红书时尚类达人，粉丝20-100万，完播率高" ->
//                    influencerRepository.queryXhsFashionFansRangeHighCompletionTop20();
//            case "抖音旅游类达人，爆款潜力S级或A级，女性" ->
//                    influencerRepository.queryDouyinTravelPotentialSAFemaleTop20();
//            case "找一些母婴类达人，亲民风格，商单口碑好" ->
//                    influencerRepository.queryMotherBabyFriendlyStyleGoodReputationTop20();
//            case "运动健身类达人，男性，粉丝在增长中" ->
//                    influencerRepository.querySportsFitnessMaleGrowthIncreasingTop20();
//            default -> List.of();
//        };
//        return filtered.stream().map(this::influencerToDTO).toList();
//    }

    public Map<String, Object> getStatsSummary() {
        long total = influencerRepository.count();
        long highPotential = influencerRepository.countHighPotentialLevelSA();
        Long avgFollowers = influencerRepository.avgFollowersCountAsLong();
        long distinctPlatforms = influencerRepository.countDistinctPlatforms();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalInfluencers", total);
        result.put("highPotentialCount", highPotential);
        result.put("averageFollowersCount", avgFollowers == null ? 0L : avgFollowers);
        result.put("platformCount", distinctPlatforms);
        return result;
    }

//    private InfluencerDTO influencerToDTO(Influencer influencer) {
//        InfluencerDTO influencerDTO = new InfluencerDTO();
//        influencerDTO.setName(influencer.getName());
//        influencerDTO.setAvatar(influencer.getAvatar());
//        influencerDTO.setPlatform(influencer.getPlatform());
//        influencerDTO.setCategory(influencer.getCategory());
//        influencerDTO.setGender(influencer.getGender());
//        influencerDTO.setAgeRange(influencer.getAgeRange());
//        influencerDTO.setLocation(influencer.getLocation());
//        influencerDTO.setFollowersCount(influencer.getFollowersCount());
//        influencerDTO.setAvgViews(influencer.getAvgViews());
//        influencerDTO.setEngagementRate(influencer.getEngagementRate());
//        influencerDTO.setCompletionRate(influencer.getCompletionRate());
//        influencerDTO.setPublishFrequency30d(influencer.getPublishFrequency30d());
//        influencerDTO.setPublishFrequency90d(influencer.getPublishFrequency90d());
//        influencerDTO.setExplosiveContentCount(influencer.getExplosiveContentCount());
//        influencerDTO.setFansGrowthTrend(influencer.getFansGrowthTrend());
//        influencerDTO.setStyleTags(influencer.getStyleTags());
//        influencerDTO.setPersonaStability(influencer.getPersonaStability());
//        influencerDTO.setCooperationReputation(influencer.getCooperationReputation());
//        influencerDTO.setCommentQuality(influencer.getCommentQuality());
//        influencerDTO.setContentInnovation(influencer.getContentInnovation());
//        influencerDTO.setPlatformIndex(influencer.getPlatformIndex());
//        influencerDTO.setPlatformRecommendationProb(influencer.getPlatformRecommendationProb());
//        influencerDTO.setScores(new InfluencerDTO.Scores(
//                influencer.getScores().getInfluence_score(),
//                influencer.getScores().getStickiness_score(),
//                influencer.getScores().getPotential_score()
//        ));
//        influencerDTO.setPotentialLevel(influencer.getPotentialLevel());
//        influencerDTO.setPredictionReasons(influencer.getPredictionReasons());
//        influencerDTO.setPriceRange(influencer.getPriceRange());
//        influencerDTO.setPriceMin(influencer.getPriceMin());
//        influencerDTO.setPriceMax(influencer.getPriceMax());
//        influencerDTO.setVerified(influencer.getVerified());
//        influencerDTO.setContact(new InfluencerDTO.Contact(
//                influencer.getContact() != null && Boolean.TRUE.equals(influencer.getContact().getWechat()),
//                influencer.getContact() != null && Boolean.TRUE.equals(influencer.getContact().getEmail()),
//                influencer.getContact() != null && Boolean.TRUE.equals(influencer.getContact().getPhone())
//        ));
//        influencerDTO.setRecentWorks(influencer.getRecentWorks());
//        return influencerDTO;
//    }
}
