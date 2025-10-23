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
    private Influencer.Scores scores;
    private String potentialLevel;
    private List<String> predictionReasons;
    private String priceRange;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private Boolean verified;
    private Influencer.Contact contact;
    private List<String> recentWorks;
}
