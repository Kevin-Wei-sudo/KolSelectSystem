package com.data.creator.dto;

import lombok.Data;

import java.util.List;

@Data
public class SearchRequest {
    private List<String> platforms;
    private List<String> categories;
    private List<String> styleTags;
    private List<String> genders;
    private List<String> potentialLevels;
    private List<String> growthTrends;

    private Long followersMin;
    private Long followersMax;
    private Double engagementRateMin;
    private Double completionRateMin;
    // 新增：四维评分下限
    private Integer adaptabilityScoreMin;
    private Integer influenceScoreMin;
    private Integer stickinessScoreMin;
    private Integer potentialScoreMin;

    private Integer page = 1;
    private Integer pageSize = 20;

    private String sortBy = "followers_count"; // followers_count, avg_views, engagement_rate, potential_level
    private String sortOrder = "desc"; // asc/desc
}