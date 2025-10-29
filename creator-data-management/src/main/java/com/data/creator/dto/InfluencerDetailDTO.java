package com.data.creator.dto;

import com.data.creator.entities.Influencer;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InfluencerDetailDTO {
    
    // 基础信息
    private Long id;
    private String name;
    private String avatar;
    private String platform;
    private List<String> category;
    private String gender;
    private String ageRange;
    private String location;
    private Boolean verified;
    private String mcn;
    
    // 数据指标
    private Integer followersCount;
    private Integer avgViews;
    private BigDecimal engagementRate;
    private BigDecimal completionRate;
    private Integer publishFrequency30d;
    private Integer publishFrequency90d;
    private Integer explosiveContentCount;
    private String fansGrowthTrend;
    
    // 评分和潜力
    private Influencer.Scores scores;
    private String potentialLevel;
    private List<String> predictionReasons;
    
    // 价格信息
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private String priceRange;
    
    // 联系和合作信息
    private Influencer.Contact contact;
    private List<Works> recentWorks;
    private List<String> cooperationHistory;
    private BigDecimal cooperationReputation;
    
    // 标签和画像
    private List<String> tags;
    private Influencer.FansProfile fansProfile;
    
    // 趋势数据
    private List<Long> followersTrend;
    private List<Long> viewsTrend;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Works {
        private String videoUrl;
        private String cover;
        private Statistics statistics;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Statistics {
            private Integer recommendCount;
            private Integer commentCount;
            private Integer diggCount;
            private Integer admireCount;
            private Integer playCount;
            private Integer shareCount;
            private Integer collectCount;
        }
    }
}