package com.data.creator.dto;

import lombok.Data;
import java.util.List;

/**
 * 达人搜索请求参数 DTO
 */
@Data
public class SearchRequest {

    /** 平台，如：抖音、小红书、B站 */
    private List<String> platform;

    /** 达人分类，如：汽车达人、美妆达人 */
    private List<String> category;

    /** 风格标签，如：结婚热搜、亲民风、职场干货 */
    private List<String> styleTag;

    /** 性别，如：男、女 */
    private List<String> gender;

    /** 潜力等级，如：S+、A、A+ */
    private List<String> potentialLevel;

    /** 粉丝增长趋势，如：强劲增长、上升期、平稳 */
    private List<String> fansGrowthTrend;

    /** 粉丝区间（最小值） */
    private Long followersMin;

    /** 粉丝区间（最大值） */
    private Long followersMax;

    /** 最小互动率 */
    private Double engagementRateMin;

    /** 最小完播率 */
    private Double completionRateMin;

    /** 最小适配度分数 */
    private Integer adaptabilityScoreMin;

    /** 最小影响力分数 */
    private Integer influenceScoreMin;

    /** 最小粘性分数 */
    private Integer stickinessScoreMin;

    /** 最小潜力分数 */
    private Integer potentialScoreMin;

    /** 页码（从1开始） */
    private Integer page = 1;

    /** 每页条数 */
    private Integer pageSize = 20;

    /** 排序字段，如：followers_count, avg_views, engagement_rate, potential_level */
    private String sortBy = "influence";

    /** 排序方向：asc / desc */
    private String sortOrder = "desc";
}
