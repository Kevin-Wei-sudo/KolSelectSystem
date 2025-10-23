package com.data.creator.dtos;

import com.data.creator.entities.Influencer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfluencerDTO {
    private String name;
    private String avatar;
    private String platform;
    private List<String> category;
    private String gender;
    private String ageRange;
    private String location;
    private Long followersCount;
    private Long avgViews;
    private BigDecimal engagementRate;
    private BigDecimal completionRate;
    private Integer publishFrequency30d;
    private Integer publishFrequency90d;
    private Integer explosiveContentCount;
    private String fansGrowthTrend;
    private List<String> styleTags;
    private BigDecimal personaStability;
    private BigDecimal cooperationReputation;
    private BigDecimal commentQuality;
    private BigDecimal contentInnovation;
    private BigDecimal platformIndex;
    private BigDecimal platformRecommendationProb;
    private Scores scores;
    private String potentialLevel;
    private List<String> predictionReasons;
    private String priceRange;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private Boolean verified;
    private Contact contact;
    private List<String> recentWorks;


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Scores {
        //适配度
        private Integer adaptability_score;
        //影响力
        private Integer influence_score;
        //粉丝粘性
        private Integer stickiness_score;
        //爆款潜力
        private Integer potential_score;

        public Scores(Integer influenceScore, Integer stickinessScore, Integer potentialScore) {
            this.influence_score = influenceScore;
            this.stickiness_score = stickinessScore;
            this.potential_score = potentialScore;
        }
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
