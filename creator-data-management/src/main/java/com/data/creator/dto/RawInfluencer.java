package com.data.creator.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RawInfluencer {
    private String name;
    private String avatar;
    private String platform;
    private List<String> category;
    private String gender;
    @JsonProperty("age_range")
    private String ageRange;
    private String location;
    @JsonProperty("followers_count")
    private Integer followersCount;
    @JsonProperty("avg_views")
    private Integer avgViews;
    @JsonProperty("engagement_rate")
    private BigDecimal engagementRate;
    @JsonProperty("completion_rate")
    private BigDecimal completionRate;
    @JsonProperty("publish_frequency30d")
    private Integer publishFrequency30d;
    @JsonProperty("publish_frequency90d")
    private Integer publishFrequency90d;
    @JsonProperty("explosive_content_count")
    private Integer explosiveContentCount;
    @JsonProperty("fans_growth_trend")
    private String fansGrowthTrend;
    @JsonProperty("style_tags")
    private List<String> styleTags;
    @JsonProperty("persona_stability")
    private BigDecimal personaStability;
    @JsonProperty("cooperation_reputation")
    private BigDecimal cooperationReputation;
    @JsonProperty("fans_profile")
    private FansProfile fansProfile;
    @JsonProperty("comment_quality")
    private BigDecimal commentQuality;
    @JsonProperty("content_innovation")
    private BigDecimal contentInnovation;
    @JsonProperty("platform_index")
    private BigDecimal platformIndex;
    @JsonProperty("platform_recommendation_prob")
    private BigDecimal platformRecommendationProb;
    private Scores scores;
    @JsonProperty("potential_level")
    private String potentialLevel;
    @JsonProperty("prediction_reasons")
    private List<String> predictionReasons;

    @JsonProperty("price_range")
    private String priceRange;
    @JsonProperty("price_min")
    private BigDecimal priceMin;
    @JsonProperty("price_max")
    private BigDecimal priceMax;

    @JsonProperty("verified")
    private Boolean verified;
    private String mcn;
    private Contact contact;

    @JsonProperty("recent_works")
    private List<String> recentWorks;
    @JsonProperty("cooperation_history")
    private List<Object> cooperationHistory;
    private List<String> tags;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FansProfile {
        private Integer age_18_24;
        private Integer age_25_34;
        private Integer gender_female;
        private Integer gender_male;
        private Integer cities_tier1;
        private Integer cities_tier2;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Scores {
        private Integer adaptability_score;
        private Integer influence_score;
        private Integer stickiness_score;
        private Integer potential_score;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Contact {
        private Boolean wechat;
        private Boolean email;
        private Boolean phone;
    }
}