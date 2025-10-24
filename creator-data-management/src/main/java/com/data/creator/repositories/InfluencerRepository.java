package com.data.creator.repositories;

import com.data.creator.entities.Influencer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InfluencerRepository extends JpaRepository<Influencer, String> {
    // 1) 小红书 美妆 女性 粉丝10-50万 互动率高（按互动率降序，取10个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%小红书%' " +
            "  AND COALESCE(category::text, '') ILIKE '%美妆%' " +
            "  AND gender = '女' " +
            "  AND followers_count BETWEEN 100000 AND 500000 " +
            "  AND engagement_rate >= 7.5 " +
            "ORDER BY engagement_rate DESC " +
            "LIMIT 10",
            nativeQuery = true)
    List<Influencer> queryXhsBeautyFemaleHighEngagementTop10();

    // 2) 抖音 美食 爆款潜力高 粉丝在上升期（按潜力分降序，取20个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%抖音%' " +
            "  AND COALESCE(category::text, '') ILIKE '%美食%' " +
            "  AND (scores->>'potential_score')::int >= 80 " +
            "  AND fans_growth_trend ILIKE '%上升%' " +
            "ORDER BY (scores->>'potential_score')::int DESC " +
            "LIMIT 20",
            nativeQuery = true)
    List<Influencer> queryDouyinFoodHighPotentialRisingTop20();

    // 3) B站 数码 专业风格 粉丝50万以上（按影响力分降序，取5个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE (platform ILIKE '%B站%' OR platform ILIKE '%哔哩哔哩%' OR platform ILIKE '%bilibili%') " +
            "  AND COALESCE(category::text, '') ILIKE '%数码%' " +
            "  AND tag @> '[\"专业\"]'::jsonb " +
            "  AND followers_count >= 500000 " +
            "ORDER BY (scores->>'influence_score')::int DESC " +
            "LIMIT 5",
            nativeQuery = true)
    List<Influencer> queryBiliDigitalProfessionalFollowersOver500KTop5();

    // 4) 快手 搞笑 性价比高 口碑好（按口碑降序，取20个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%快手%' " +
            "  AND COALESCE(category::text, '') ILIKE '%搞笑%' " +
            "  AND price_range IN ('低','中') " +
            "  AND cooperation_reputation >= 4.5 " +
            "ORDER BY cooperation_reputation DESC " +
            "LIMIT 20",
            nativeQuery = true)
    List<Influencer> queryKuaishouComedyCostEffectiveGoodReputationTop20();

    // 5) 小红书 时尚 粉丝20-100万 完播率高（按完播率降序，取20个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%小红书%' " +
            "  AND COALESCE(category::text, '') ILIKE '%时尚%' " +
            "  AND followers_count BETWEEN 200000 AND 1000000 " +
            "  AND completion_rate >= 50 " +
            "ORDER BY completion_rate DESC " +
            "LIMIT 20",
            nativeQuery = true)
    List<Influencer> queryXhsFashionFansRangeHighCompletionTop20();

    // 6) 抖音 旅游 潜力等级S/A 女性（等级优先，潜力分降序，取20个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE platform ILIKE '%抖音%' " +
            "  AND COALESCE(category::text, '') ILIKE '%旅游%' " +
            "  AND UPPER(potential_level) IN ('S','A') " +
            "  AND gender = '女性' " +
            "ORDER BY CASE UPPER(potential_level) WHEN 'S' THEN 3 WHEN 'A' THEN 2 WHEN 'B' THEN 1 ELSE 0 END DESC, " +
            "         (scores->>'potential_score')::int DESC " +
            "LIMIT 20",
            nativeQuery = true)
    List<Influencer> queryDouyinTravelPotentialSAFemaleTop20();

    // 7) 母婴 亲民风格 商单口碑好（不限定平台，按口碑降序，取20个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE COALESCE(category::text, '') ILIKE '%母婴%' " +
            "  AND tag @> '[\"亲民\"]'::jsonb " +
            "  AND cooperation_reputation >= 4.5 " +
            "ORDER BY cooperation_reputation DESC " +
            "LIMIT 20",
            nativeQuery = true)
    List<Influencer> queryMotherBabyFriendlyStyleGoodReputationTop20();

    // 8) 运动健身 男性 粉丝在增长中（不限定平台，按粘性分降序，取20个）
    @Query(value = "SELECT * FROM sys_influencer " +
            "WHERE (COALESCE(category::text, '') ILIKE '%运动健身%' OR COALESCE(category::text, '') ILIKE '%健身%') " +
            "  AND gender = '男性' " +
            "  AND (fans_growth_trend ILIKE '%上升%' OR fans_growth_trend ILIKE '%增长中%') " +
            "ORDER BY (scores->>'stickiness_score')::int DESC " +
            "LIMIT 20",
            nativeQuery = true)
    List<Influencer> querySportsFitnessMaleGrowthIncreasingTop20();

    @Query(value = "SELECT COUNT(*) FROM sys_influencer WHERE UPPER(potential_level) IN ('S','A')", nativeQuery = true)
    long countHighPotentialLevelSA();

    @Query(value = "SELECT COALESCE(AVG(followers_count), 0)::bigint FROM sys_influencer", nativeQuery = true)
    Long avgFollowersCountAsLong();

    @Query(value = "SELECT COUNT(DISTINCT platform) FROM sys_influencer", nativeQuery = true)
    long countDistinctPlatforms();

    @Query(value = "SELECT platform, COUNT(*) AS cnt FROM sys_influencer GROUP BY platform", nativeQuery = true)
    List<Object[]> countByPlatform();
}
