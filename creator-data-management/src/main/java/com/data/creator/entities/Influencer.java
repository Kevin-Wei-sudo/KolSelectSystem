package com.data.creator.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sys_influencer")
@EntityListeners(AuditingEntityListener.class)
public class Influencer {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    @Comment("达人ID")
    private Long id;

    @Column(name = "name", nullable = false, length = 128)
    @Comment("达人名称")
    private String name;

    @Column(name = "avatar", length = 512)
    @Comment("头像URL")
    private String avatar;

    @Column(name = "platform", length = 64)
    @Comment("所属平台，如抖音、快手")
    private String platform;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "category", columnDefinition = "jsonb")
    @Comment("达人分类，如美妆、旅游等")
    private List<String> category;

    @Column(name = "gender", length = 8)
    @Comment("性别")
    private String gender;

    @Column(name = "age_range", length = 32)
    @Comment("年龄区间")
    private String ageRange;

    @Column(name = "location", length = 64)
    @Comment("所在地")
    private String location;

    @Column(name = "followers_count")
    @Comment("粉丝数")
    private Integer followersCount;

    @Column(name = "avg_views")
    @Comment("平均播放量")
    private Integer avgViews;

    @Column(name = "engagement_rate", precision = 4, scale = 2)
    @Comment("互动率")
    private BigDecimal engagementRate;

    @Column(name = "completion_rate", precision = 4, scale = 2)
    @Comment("完播率")
    private BigDecimal completionRate;

    @Column(name = "publish_frequency_30d")
    @Comment("近30天发布频率")
    private Integer publishFrequency30d;

    @Column(name = "publish_frequency_90d")
    @Comment("近90天发布频率")
    private Integer publishFrequency90d;

    @Column(name = "explosive_content_count")
    @Comment("爆款内容数量")
    private Integer explosiveContentCount;

    @Column(name = "fans_growth_trend", length = 32)
    @Comment("粉丝增长趋势")
    private String fansGrowthTrend;

    @Column(name = "tag", length = 64)
    @Comment("风格标签")
    private List<String> styleTags;

    @Column(name = "persona_stability", precision = 4, scale = 2)
    @Comment("人设稳定性")
    private BigDecimal personaStability;

    @Column(name = "cooperation_reputation", precision = 4, scale = 2)
    @Comment("合作口碑")
    private BigDecimal cooperationReputation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fans_profile", columnDefinition = "jsonb")
    @Comment("粉丝画像")
    private FansProfile fansProfile;

    @Column(name = "comment_quality", precision = 4, scale = 2)
    @Comment("评论质量")
    private BigDecimal commentQuality;

    @Column(name = "content_innovation", precision = 4, scale = 2)
    @Comment("内容创新度")
    private BigDecimal contentInnovation;

    @Column(name = "platform_index", precision = 4, scale = 2)
    @Comment("平台指数")
    private BigDecimal platformIndex;

    @Column(name = "platform_recommendation_prob", precision = 4, scale = 2)
    @Comment("平台推荐概率")
    private BigDecimal platformRecommendationProb;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scores", columnDefinition = "jsonb")
    @Comment("评分信息")
    private Scores scores;

    @Column(name = "potential_level", length = 4)
    @Comment("潜力等级")
    private String potentialLevel;

    @Column(name = "reason", length = 256)
    @Comment("潜力预测原因")
    private List<String> predictionReasons;

    @Column(name = "price_range", length = 16)
    @Comment("报价区间（低、中、高）")
    private String priceRange;

    @Column(name = "price_min")
    @Comment("最低报价")
    private BigDecimal priceMin;

    @Column(name = "price_max")
    @Comment("最高报价")
    private BigDecimal priceMax;

    @Column(name = "verified")
    @Comment("是否已认证")
    private Boolean verified;

    @Column(name = "mcn", length = 128)
    @Comment("所属MCN机构")
    private String mcn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "contact", columnDefinition = "jsonb")
    @Comment("联系方式")
    private Contact contact;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recent_works", columnDefinition = "jsonb")
    @Comment("近期作品")
    private List<Works> recentWorks;

//    @JdbcTypeCode(SqlTypes.JSON)
//    @Column(name = "cooperation_history", columnDefinition = "jsonb")
//    @Comment("合作历史")
//    private List<Object> cooperationHistory;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "jsonb")
    @Comment("其他标签")
    private List<String> tags;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("创建时间")
    private Long createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @Comment("更新时间")
    private Long updatedAt;

    // ---------- 子类 ----------

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FansProfile {
        private Integer age_18_24;
        private Integer age_25_34;
        private Integer gender_female;
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Works {
        private String videoUrl;
        private String cover;
    }
}