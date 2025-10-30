package com.data.creator.repositories;

import com.data.creator.entities.Influencer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface InfluencerRepository extends JpaRepository<Influencer, String> {

    // 1) 小红书 美妆 女性 粉丝10-50万 互动率高（按互动率降序）
    @Query(value = """
            SELECT * FROM sys_influencer
            WHERE category @> to_jsonb(ARRAY[:category]::text[])
              AND platform ILIKE CONCAT('%', :platform, '%')
              AND gender = :gender
              AND followers_count BETWEEN :minFollowers AND :maxFollowers
              AND engagement_rate >= :minEngagement
            ORDER BY engagement_rate DESC
            """,
            countQuery = """
                    SELECT COUNT(*) FROM sys_influencer
                    WHERE category @> to_jsonb(ARRAY[:category]::text[])
                      AND platform ILIKE CONCAT('%', :platform, '%')
                      AND gender = :gender
                      AND followers_count BETWEEN :minFollowers AND :maxFollowers
                      AND engagement_rate >= :minEngagement
                    """,
            nativeQuery = true)
    Page<Influencer> findByCategoryContainsAndPlatformGenderFollowersRangeEngagement(
            @Param("category") String category,
            @Param("platform") String platform,
            @Param("gender") String gender,
            @Param("minFollowers") Integer minFollowers,
            @Param("maxFollowers") Integer maxFollowers,
            @Param("minEngagement") BigDecimal minEngagement,
            Pageable pageable
    );


    // 2) 抖音 美食 爆款潜力高 粉丝在上升期（按潜力分降序）
    @Query(value = """
            SELECT *
            FROM sys_influencer
            WHERE (:platform IS NULL OR platform ILIKE CONCAT('%', :platform, '%'))
              AND (:category IS NULL OR category @> to_jsonb(ARRAY[:category]::text[]))
              AND (:minScore IS NULL OR (scores ->> 'potential_score')::int >= :minScore)
              AND (:trend IS NULL OR fans_growth_trend ILIKE CONCAT('%', :trend, '%'))
            ORDER BY (scores ->> 'potential_score')::int DESC
            """,
            countQuery = """
                    SELECT COUNT(*)
                    FROM sys_influencer
                    WHERE (:platform IS NULL OR platform ILIKE CONCAT('%', :platform, '%'))
                      AND (:category IS NULL OR category @> to_jsonb(ARRAY[:category]::text[]))
                      AND (:minScore IS NULL OR (scores ->> 'potential_score')::int >= :minScore)
                      AND (:trend IS NULL OR fans_growth_trend ILIKE CONCAT('%', :trend, '%'))
                    """,
            nativeQuery = true)
    Page<Influencer> queryInfluencersByDynamicConditions(
            @Param("platform") String platform,
            @Param("category") String category,
            @Param("minScore") Integer minScore,
            @Param("trend") String trend,
            Pageable pageable
    );


    // 3) B站 数码 专业风格 粉丝50万以上（按影响力降序）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE (platform ILIKE '%B站%' OR platform ILIKE '%哔哩哔哩%' OR platform ILIKE '%bilibili%') " +
            "  AND COALESCE(category::text, '') ILIKE '%数码%' " +
            "  AND tag @> '[\"专业\"]'::jsonb " +
            "  AND followers_count >= 500000 " +
            "ORDER BY (scores->>'influence_score')::int DESC",
            countQuery = "SELECT COUNT(*) FROM sys_influencer " +
                    "WHERE (platform ILIKE '%B站%' OR platform ILIKE '%哔哩哔哩%' OR platform ILIKE '%bilibili%') " +
                    "  AND COALESCE(category::text, '') ILIKE '%数码%' " +
                    "  AND tag @> '[\"专业\"]'::jsonb " +
                    "  AND followers_count >= 500000",
            nativeQuery = true)
    Page<Influencer> queryBiliDigitalProfessionalFollowersOver500K(Pageable pageable);


    // 4) 快手 搞笑 性价比高 口碑好（按口碑降序）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%快手%' " +
            "  AND COALESCE(category::text, '') ILIKE '%搞笑%' " +
            "  AND price_range IN ('低','中') " +
            "  AND cooperation_reputation >= 4.5 " +
            "ORDER BY cooperation_reputation DESC",
            countQuery = "SELECT COUNT(*) FROM sys_influencer " +
                    "WHERE platform ILIKE '%快手%' " +
                    "  AND COALESCE(category::text, '') ILIKE '%搞笑%' " +
                    "  AND price_range IN ('低','中') " +
                    "  AND cooperation_reputation >= 4.5",
            nativeQuery = true)
    Page<Influencer> queryKuaishouComedyCostEffectiveGoodReputation(Pageable pageable);


    // 5) 小红书 时尚 粉丝20-100万 完播率高（按完播率降序）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%小红书%' " +
            "  AND COALESCE(category::text, '') ILIKE '%时尚%' " +
            "  AND followers_count BETWEEN 200000 AND 1000000 " +
            "  AND completion_rate >= 50 " +
            "ORDER BY completion_rate DESC",
            countQuery = "SELECT COUNT(*) FROM sys_influencer " +
                    "WHERE platform ILIKE '%小红书%' " +
                    "  AND COALESCE(category::text, '') ILIKE '%时尚%' " +
                    "  AND followers_count BETWEEN 200000 AND 1000000 " +
                    "  AND completion_rate >= 50",
            nativeQuery = true)
    Page<Influencer> queryXhsFashionFansRangeHighCompletion(Pageable pageable);


    // 6) 抖音 旅游 潜力等级S/A 女性
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%抖音%' " +
            "  AND COALESCE(category::text, '') ILIKE '%旅游%' " +
            "  AND UPPER(potential_level) IN ('S','A') " +
            "  AND gender = '女性' " +
            "ORDER BY CASE UPPER(potential_level) WHEN 'S' THEN 3 WHEN 'A' THEN 2 WHEN 'B' THEN 1 ELSE 0 END DESC, " +
            "         (scores->>'potential_score')::int DESC",
            countQuery = "SELECT COUNT(*) FROM sys_influencer " +
                    "WHERE platform ILIKE '%抖音%' " +
                    "  AND COALESCE(category::text, '') ILIKE '%旅游%' " +
                    "  AND UPPER(potential_level) IN ('S','A') " +
                    "  AND gender = '女性'",
            nativeQuery = true)
    Page<Influencer> queryDouyinTravelPotentialSAFemale(Pageable pageable);


    // 7) 母婴 亲民风格 商单口碑好
    @Query(value = """
    SELECT *
    FROM sys_influencer
    WHERE (:category IS NULL OR category @> to_jsonb(ARRAY[:category]::text[]))
      AND (:minReputation IS NULL OR cooperation_reputation >= :minReputation)
    ORDER BY cooperation_reputation DESC
    """,
            countQuery = """
    SELECT COUNT(*)
    FROM sys_influencer
    WHERE (:category IS NULL OR category @> to_jsonb(ARRAY[:category]::text[]))
      AND (:minReputation IS NULL OR cooperation_reputation >= :minReputation)
    """,
            nativeQuery = true)
    Page<Influencer> queryFriendlyStyleByCategoryAndReputation(
            @Param("category") String category,
            @Param("minReputation") BigDecimal minReputation,
            Pageable pageable
    );


    // 8) 运动健身 男性 粉丝在增长中
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE (COALESCE(category::text, '') ILIKE '%运动健身%' OR COALESCE(category::text, '') ILIKE '%健身%') " +
            "  AND gender = '男性' " +
            "  AND (fans_growth_trend ILIKE '%上升%' OR fans_growth_trend ILIKE '%增长中%') " +
            "ORDER BY (scores->>'stickiness_score')::int DESC",
            countQuery = "SELECT COUNT(*) FROM sys_influencer " +
                    "WHERE (COALESCE(category::text, '') ILIKE '%运动健身%' OR COALESCE(category::text, '') ILIKE '%健身%') " +
                    "  AND gender = '男性' " +
                    "  AND (fans_growth_trend ILIKE '%上升%' OR fans_growth_trend ILIKE '%增长中%')",
            nativeQuery = true)
    Page<Influencer> querySportsFitnessMaleGrowthIncreasing(Pageable pageable);
}
