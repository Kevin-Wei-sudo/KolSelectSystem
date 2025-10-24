package com.data.creator.services;

import com.data.creator.dtos.InfluencerDTO;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import java.util.Map;
import java.util.LinkedHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class InfluencerService {
    private final InfluencerRepository influencerRepository;
    private final EmbeddingService embeddingService;

    public void saveInfluencers(List<InfluencerDTO> influencers) {
        List<Influencer> newInfluencers = new ArrayList<>();
        for (InfluencerDTO influencer : influencers) {
            Influencer newInfluencer = influencerDTOtoInfluencer(influencer);
            newInfluencers.add(newInfluencer);
        }
        influencerRepository.saveAll(newInfluencers);
    }

    public List<InfluencerDTO> findAll() {
        return influencerRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::influencerToDTO)
                .collect(Collectors.toList());
    }

    private Influencer influencerDTOtoInfluencer(InfluencerDTO influencerDTO) {
        Influencer influencer = new Influencer();
        influencer.setName(influencerDTO.getName());
        influencer.setAvatar(influencerDTO.getAvatar());
        influencer.setPlatform(influencerDTO.getPlatform());
        influencer.setCategory(influencerDTO.getCategory());
        influencer.setGender(influencerDTO.getGender());
        influencer.setAgeRange(influencerDTO.getAgeRange());
        influencer.setLocation(influencerDTO.getLocation());
        influencer.setFollowersCount(influencerDTO.getFollowersCount());
        influencer.setAvgViews(influencerDTO.getAvgViews());
        influencer.setEngagementRate(influencerDTO.getEngagementRate());
        influencer.setCompletionRate(influencerDTO.getCompletionRate());
        influencer.setPublishFrequency30d(influencerDTO.getPublishFrequency30d());
        influencer.setPublishFrequency90d(influencerDTO.getPublishFrequency90d());
        influencer.setExplosiveContentCount(influencerDTO.getExplosiveContentCount());
        influencer.setFansGrowthTrend(influencerDTO.getFansGrowthTrend());
        influencer.setStyleTags(influencerDTO.getStyleTags());
        influencer.setPersonaStability(influencerDTO.getPersonaStability());
        influencer.setCooperationReputation(influencerDTO.getCooperationReputation());
        influencer.setCommentQuality(influencerDTO.getCommentQuality());
        influencer.setContentInnovation(influencerDTO.getContentInnovation());
        influencer.setPlatformIndex(influencerDTO.getPlatformIndex());
        influencer.setPlatformRecommendationProb(influencerDTO.getPlatformRecommendationProb());
        influencer.setScores(new Influencer.Scores(
                influencerDTO.getScores().getInfluence_score(),
                influencerDTO.getScores().getStickiness_score(),
                influencerDTO.getScores().getPotential_score()
        ));
        influencer.setPotentialLevel(influencerDTO.getPotentialLevel());
        influencer.setPredictionReasons(influencerDTO.getPredictionReasons());
        influencer.setPriceRange(influencerDTO.getPriceRange());
        influencer.setPriceMin(influencerDTO.getPriceMin());
        influencer.setPriceMax(influencerDTO.getPriceMax());
        influencer.setVerified(influencerDTO.getVerified());
        InfluencerDTO.Contact contactDTO = influencerDTO.getContact();
        influencer.setContact(new Influencer.Contact(
                contactDTO != null && Boolean.TRUE.equals(contactDTO.getWechat()),
                contactDTO != null && Boolean.TRUE.equals(contactDTO.getEmail()),
                contactDTO != null && Boolean.TRUE.equals(contactDTO.getPhone())
        ));
        influencer.setRecentWorks(influencerDTO.getRecentWorks());
        influencer.setEmbedding(embeddingService.generateEmbedding(buildSemanticText(influencerDTO)));
        return influencer;
    }

    private InfluencerDTO influencerToDTO(Influencer influencer) {
        InfluencerDTO influencerDTO = new InfluencerDTO();
        influencerDTO.setName(influencer.getName());
        influencerDTO.setAvatar(influencer.getAvatar());
        influencerDTO.setPlatform(influencer.getPlatform());
        influencerDTO.setCategory(influencer.getCategory());
        influencerDTO.setGender(influencer.getGender());
        influencerDTO.setAgeRange(influencer.getAgeRange());
        influencerDTO.setLocation(influencer.getLocation());
        influencerDTO.setFollowersCount(influencer.getFollowersCount());
        influencerDTO.setAvgViews(influencer.getAvgViews());
        influencerDTO.setEngagementRate(influencer.getEngagementRate());
        influencerDTO.setCompletionRate(influencer.getCompletionRate());
        influencerDTO.setPublishFrequency30d(influencer.getPublishFrequency30d());
        influencerDTO.setPublishFrequency90d(influencer.getPublishFrequency90d());
        influencerDTO.setExplosiveContentCount(influencer.getExplosiveContentCount());
        influencerDTO.setFansGrowthTrend(influencer.getFansGrowthTrend());
        influencerDTO.setStyleTags(influencer.getStyleTags());
        influencerDTO.setPersonaStability(influencer.getPersonaStability());
        influencerDTO.setCooperationReputation(influencer.getCooperationReputation());
        influencerDTO.setCommentQuality(influencer.getCommentQuality());
        influencerDTO.setContentInnovation(influencer.getContentInnovation());
        influencerDTO.setPlatformIndex(influencer.getPlatformIndex());
        influencerDTO.setPlatformRecommendationProb(influencer.getPlatformRecommendationProb());
        influencerDTO.setScores(new InfluencerDTO.Scores(
                influencer.getScores().getInfluence_score(),
                influencer.getScores().getStickiness_score(),
                influencer.getScores().getPotential_score()
        ));
        influencerDTO.setPotentialLevel(influencer.getPotentialLevel());
        influencerDTO.setPredictionReasons(influencer.getPredictionReasons());
        influencerDTO.setPriceRange(influencer.getPriceRange());
        influencerDTO.setPriceMin(influencer.getPriceMin());
        influencerDTO.setPriceMax(influencer.getPriceMax());
        influencerDTO.setVerified(influencer.getVerified());
        influencerDTO.setContact(new InfluencerDTO.Contact(
                influencer.getContact() != null && Boolean.TRUE.equals(influencer.getContact().getWechat()),
                influencer.getContact() != null && Boolean.TRUE.equals(influencer.getContact().getEmail()),
                influencer.getContact() != null && Boolean.TRUE.equals(influencer.getContact().getPhone())
        ));
        influencerDTO.setRecentWorks(influencer.getRecentWorks());
        return influencerDTO;
    }

    private String buildSemanticText(InfluencerDTO dto) {
        StringBuilder sb = new StringBuilder();
        if (dto.getName() != null) sb.append(dto.getName()).append("，");
        if (dto.getCategory() != null) sb.append("分类：").append(dto.getCategory()).append("，");
        if (dto.getStyleTags() != null) sb.append("风格标签：").append(String.join("、", dto.getStyleTags())).append("，");
        if (dto.getPredictionReasons() != null) sb.append("潜力理由：").append(String.join("、", dto.getPredictionReasons())).append("，");
        if (dto.getRecentWorks() != null) sb.append("近期作品：").append(String.join("；", dto.getRecentWorks()));
        if (dto.getPredictionReasons() != null) sb.append("潜力预测原因：").append(String.join("、", dto.getPredictionReasons())).append("，");
        return sb.toString().trim();
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


    public List<InfluencerDTO> searchByPresetPhrase(String phrase) {
        List<Influencer> filtered = switch (phrase.trim()) {
            case "帮我找10个小红书美妆类的女性达人，粉丝在10-50万，互动率要高" ->
                    influencerRepository.queryXhsBeautyFemaleHighEngagementTop10();
            case "找一些抖音美食类的达人，爆款潜力高，粉丝在上升期" ->
                    influencerRepository.queryDouyinFoodHighPotentialRisingTop20();
            case "推荐几个B站数码类的达人，专业风格，粉丝50万以上" ->
                    influencerRepository.queryBiliDigitalProfessionalFollowersOver500KTop5();
            case "找快手搞笑类达人，性价比高，口碑好" ->
                    influencerRepository.queryKuaishouComedyCostEffectiveGoodReputationTop20();
            case "小红书时尚类达人，粉丝20-100万，完播率高" ->
                    influencerRepository.queryXhsFashionFansRangeHighCompletionTop20();
            case "抖音旅游类达人，爆款潜力S级或A级，女性" ->
                    influencerRepository.queryDouyinTravelPotentialSAFemaleTop20();
            case "找一些母婴类达人，亲民风格，商单口碑好" ->
                    influencerRepository.queryMotherBabyFriendlyStyleGoodReputationTop20();
            case "运动健身类达人，男性，粉丝在增长中" ->
                    influencerRepository.querySportsFitnessMaleGrowthIncreasingTop20();
            default -> List.of();
        };
        return filtered.stream().map(this::influencerToDTO).toList();
    }

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
}
