package com.data.creator.services;

import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataImportService {

    private final InfluencerRepository influencerRepository;

    public int reloadFromResources() {
        // 清空旧数据
        influencerRepository.deleteAll();
        int total = 0;
        total += importFile("static/data/mock-data-douyin.json");
        total += importFile("static/data/mock-data-xiaohongshu.json");
        log.info("Imported {} influencers from JSON resources.", total);
        return total;
    }

    private int importFile(String classpathLocation) {
        try {
            ClassPathResource resource = new ClassPathResource(classpathLocation);
            try (InputStream is = resource.getInputStream()) {
                ObjectMapper mapper = new ObjectMapper();
                mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                RawInfluencer[] raws = mapper.readValue(is, RawInfluencer[].class);
                OffsetDateTime now = OffsetDateTime.now();
                int count = 0;
                for (RawInfluencer raw : raws) {
                    Influencer inf = mapToEntity(raw);
                    inf.setId(UUID.randomUUID().toString());
                    inf.setCreatedAt(now);
                    inf.setUpdatedAt(now);
                    influencerRepository.save(inf);
                    count++;
                }
                return count;
            }
        } catch (Exception e) {
            log.error("Failed to import file {}: {}", classpathLocation, e.getMessage(), e);
            return 0;
        }
    }

    private Influencer mapToEntity(RawInfluencer raw) {
        Influencer inf = new Influencer();
        inf.setName(raw.name);
        inf.setAvatar(raw.avatar);
        inf.setPlatform(raw.platform);
        // category: 取第一个或拼接
        if (raw.category != null && !raw.category.isEmpty()) {
            inf.setCategory(raw.category.get(0));
        }
        inf.setGender(raw.gender);
        inf.setAgeRange(raw.ageRange);
        inf.setLocation(raw.location);
        inf.setFollowersCount(optLong(raw.followersCount));
        inf.setAvgViews(optLong(raw.avgViews));
        inf.setEngagementRate(optBigDecimal(raw.engagementRate));
        inf.setCompletionRate(optBigDecimal(raw.completionRate));
        inf.setPublishFrequency30d(raw.publishFrequency30d);
        inf.setPublishFrequency90d(raw.publishFrequency90d);
        inf.setExplosiveContentCount(raw.explosiveContentCount);
        inf.setFansGrowthTrend(raw.fansGrowthTrend);
        inf.setStyleTags(raw.styleTags);
        inf.setPersonaStability(optBigDecimal(raw.personaStability));
        inf.setCooperationReputation(optBigDecimal(raw.cooperationReputation));
        inf.setCommentQuality(optBigDecimal(raw.commentQuality));
        inf.setContentInnovation(optBigDecimal(raw.contentInnovation));
        inf.setPlatformIndex(optBigDecimal(raw.platformIndex));
        inf.setPlatformRecommendationProb(optBigDecimal(raw.platformRecommendationProb));
        // scores
        if (raw.scores != null) {
            Influencer.Scores s = new Influencer.Scores(
                    raw.scores.adaptability_score,
                    raw.scores.influence_score,
                    raw.scores.stickiness_score,
                    raw.scores.potential_score
            );
            inf.setScores(s);
        }
        inf.setPotentialLevel(raw.potentialLevel);
        inf.setPredictionReasons(raw.predictionReasons);
        inf.setPriceRange(raw.priceRange);
        inf.setPriceMin(optBigDecimal(raw.priceMin));
        inf.setPriceMax(optBigDecimal(raw.priceMax));
        inf.setVerified(raw.verified);
        // contact
        if (raw.contact != null) {
            Influencer.Contact c = new Influencer.Contact(
                    raw.contact.wechat,
                    raw.contact.email,
                    raw.contact.phone
            );
            inf.setContact(c);
        }
        // recent works
        if (raw.recentWorks != null) {
            inf.setRecentWorks(new ArrayList<>(raw.recentWorks));
        }
        // tags：保留 styleTags 可作为 tags（附加）
        if (raw.styleTags != null) {
            inf.setTags(new ArrayList<>(raw.styleTags));
        }
        // fans_profile：按性别/年龄/城市生成简版画像
        inf.setFansProfile(generateFansProfile(raw));
        return inf;
    }

    private Influencer.FansProfile generateFansProfile(RawInfluencer raw) {
        int age18_24 = 30;
        int age25_34 = 40;
        if (raw.ageRange != null) {
            if (raw.ageRange.contains("20") || raw.ageRange.contains("25")) {
                age18_24 = 45;
                age25_34 = 35;
            } else if (raw.ageRange.contains("28") || raw.ageRange.contains("30")) {
                age18_24 = 25;
                age25_34 = 45;
            }
        }
        int female = "女".equals(raw.gender) ? 65 : 45;
        int tier1 = 30;
        int tier2 = 40;
        if (raw.location != null) {
            if (raw.location.contains("上海") || raw.location.contains("北京") || raw.location.contains("广州") || raw.location.contains("深圳")) {
                tier1 = 40;
                tier2 = 35;
            } else {
                tier1 = 20;
                tier2 = 45;
            }
        }
        return new Influencer.FansProfile(age18_24, age25_34, female, tier1, tier2);
    }

    private Long optLong(Number n) {
        return n == null ? null : n.longValue();
    }

    private BigDecimal optBigDecimal(Number n) {
        return n == null ? null : (n instanceof BigDecimal ? (BigDecimal) n : BigDecimal.valueOf(n.doubleValue()));
    }

    // -------- 原始 JSON DTO --------

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class RawInfluencer {
        public String name;
        public String avatar;
        public String platform;
        public List<String> category;
        public String gender;
        public String ageRange;
        public String location;
        public Number followersCount;
        public Number avgViews;
        public Number engagementRate;
        public Number completionRate;
        public Integer publishFrequency30d;
        public Integer publishFrequency90d;
        public Integer explosiveContentCount;
        public String fansGrowthTrend;
        public List<String> styleTags;
        public Number personaStability;
        public Number cooperationReputation;
        public Number commentQuality;
        public Number contentInnovation;
        public Number platformIndex;
        public Number platformRecommendationProb;
        public Scores scores;
        public String potentialLevel;
        public List<String> predictionReasons;
        public String priceRange;
        public Number priceMin;
        public Number priceMax;
        public Boolean verified;
        public Contact contact;
        public List<Object> recentWorks;
        // 可选字段
        public String mcn;
        public List<Object> cooperationHistory;

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Scores {
            public Integer adaptability_score;
            public Integer influence_score;
            public Integer stickiness_score;
            public Integer potential_score;
        }

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Contact {
            public Boolean wechat;
            public Boolean email;
            public Boolean phone;
        }
    }
}