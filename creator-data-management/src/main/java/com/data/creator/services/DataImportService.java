package com.data.creator.services;

import cn.hutool.core.lang.Snowflake;
import com.data.creator.douyin.DouyinGetUserInfoService;
import com.data.creator.douyin.DouyinGetUserVideoService;
import com.data.creator.dto.RawInfluencer;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataImportService {

    private final DouyinGetUserInfoService douyinGetUserInfoService;

    private final DouyinGetUserVideoService douyinGetUserVideoService;

    private final InfluencerRepository influencerRepository;

    private final ResourceLoader resourceLoader;

    private final Snowflake snowflake;

    @Transactional
    public void importFile() {
        String location = "classpath:static/data/mock-data-douyin.json";
        try {
            ObjectMapper mapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            RawInfluencer[] rawInfluencers = mapper.readValue(resourceLoader.getResource(location).getInputStream(), RawInfluencer[].class);
            List<String> secUserIds = Stream.of(
                    "https://www.douyin.com/user/MS4wLjABAAAAYnUYHpnrwrt_1s-I8mtc8fmvHOLKlTqfY7IjCGHhMq4",
                    "https://www.douyin.com/user/MS4wLjABAAAA8Haxmu5UNyVfhgwOqIVGITenwtaSUNKl-2oepzOuxHA",
                    "https://www.douyin.com/user/MS4wLjABAAAAGmeaBCD1FkF877GTbVOsakBHC27xuNf1PkFXY7nPzp4",
                    "https://www.douyin.com/user/MS4wLjABAAAA4BHCJRx6s1nOOQm2adN4ZnNdAW1DhprmsOsr-jUb3LQ",
                    "https://www.douyin.com/user/MS4wLjABAAAAhNHi-d7yfRBRmP2mxHV3tAmTH5fxVpriuDwyqmTV-F0",
                    "https://www.douyin.com/user/MS4wLjABAAAAc3kFtkn5Dr4uyaOWBBVGPgb1JWUhKDEWuc65P6orE2Q",
                    "https://www.douyin.com/user/MS4wLjABAAAAmfFyOF0keQDKqAJHHcEPjiuEXCWgAnHo6zxg6ytNOFI",
                    "https://www.douyin.com/user/MS4wLjABAAAA-BZu75pCWeF-l-41Wy68jncroFyLQjtwIJ3dNulj_Uk",
                    "https://www.douyin.com/user/MS4wLjABAAAA-VZVLq2y-GfS4XYThbc8xq8GGPonJnEK741TlGrRJzI",
                    "https://www.douyin.com/user/MS4wLjABAAAA9qJS8rXNZfYELnSnZE-PypNPLJ-GimGPZ4rvv6sl3OU",
                    "https://www.douyin.com/user/MS4wLjABAAAAte4Lowzp8ZUz0lvlZ9_GvwJqC8XjtB9zVG4sPSmfFF8",
                    "https://www.douyin.com/user/MS4wLjABAAAAt1k_sKG3NRwtEFmhj_afRUt4ol2zDXIEOEDv5lVzm1w",
                    "https://www.douyin.com/user/MS4wLjABAAAAdCYHqu1vcchOjHhi7Ccu4Ykkr-E_j1r8iIfb7z78p9E",
                    "https://www.douyin.com/user/MS4wLjABAAAAy8OvHm4Iek7Ytz8gFG46JfST45hgNXCS-9vF1c4DTa0",
                    "https://www.douyin.com/user/MS4wLjABAAAAjS2F8CKjcvueCO4-x5VM7ChK1Do1VAtlgXe-nEMCcls",
                    "https://www.douyin.com/user/MS4wLjABAAAAfrRoM9Rzmns3gYn2NZEH2veXDlJgQvPgwhpKnuquWkk",
                    "https://www.douyin.com/user/MS4wLjABAAAAzOa9kOdV0B93nJK72U3KgrDm1C9lL7smuFDZ6AdDI9c",
                    "https://www.douyin.com/user/MS4wLjABAAAApnigEC0Mn8xPNHn3p3nswOSskKaVYWXt3P0ocxmVuU4",
                    "https://www.douyin.com/user/MS4wLjABAAAAf_bEXQQScSwI5cfzk10Pjv5J1RYRHg2AFNUm_5WozzE",
                    "https://www.douyin.com/user/MS4wLjABAAAAdmz1bNtWbyXx4dzNvNp_6pW8SBEt6f7uJmcFciswMdc"
            ).map(s -> s.replaceFirst(".*/user/", "")).toList();

            for (int i = 0; i < 1; i++) {
                RawInfluencer dto = rawInfluencers[i];
                JsonNode userInfo = douyinGetUserInfoService.getUserInfo(secUserIds.get(i));
                // 抖音Id
                String uniqueId = userInfo.get("user").get("unique_id").asText("");
                // 抖音昵称
                String nickname  = userInfo.get("user").get("nickname").asText("");
                // 抖音关注数
                long followingCount   = userInfo.get("user").get("following_count").asLong();
                // 抖音粉丝数
                long followerCount   = userInfo.get("user").get("follower_count").asLong();
                // 抖音获赞数
                long totalFavorited = userInfo.get("user").get("total_favorited").asLong();
                // 抖音头像
                String avatar = userInfo.get("user").get("avatar_larger").get("url_list").get(0).asText("");

                List<Influencer.Works> recentWorks = new ArrayList<>();
                Integer explosiveContentCount = 0;
                JsonNode jsonNode = douyinGetUserVideoService.getUserVideo(secUserIds.get(i), 1).get(0);
                for (JsonNode video : jsonNode.get("aweme_list")) {
                    // 视频链接
                    String videoUrl = video.get("video").get("play_addr").get("url_list").get(2).asText("");
                    // 视频封面
                    String cover = video.get("video").get("cover").get("url_list").get(0).asText("");
                    recentWorks.add(new Influencer.Works(videoUrl, cover));
                    // 视频点赞数
                    long diggCount = video.get("statistics").get("digg_count").asLong();
                }

                Influencer influencer = new Influencer();
                influencer.setId(snowflake.nextId());
                influencer.setName(nickname);
                influencer.setAvatar(avatar);
                influencer.setPlatform(dto.getPlatform());
                influencer.setCategory(dto.getCategory());
                influencer.setGender(dto.getGender());
                influencer.setAgeRange(dto.getAgeRange());
                influencer.setLocation(dto.getLocation());
                influencer.setFollowersCount((int) followerCount);
                influencer.setAvgViews((int)totalFavorited);
                influencer.setEngagementRate(dto.getEngagementRate());
                influencer.setCompletionRate(dto.getCompletionRate());
                influencer.setPublishFrequency30d(dto.getPublishFrequency30d());
                influencer.setPublishFrequency90d(dto.getPublishFrequency90d());
                influencer.setExplosiveContentCount(explosiveContentCount);
                influencer.setFansGrowthTrend(dto.getFansGrowthTrend());
                influencer.setStyleTags(dto.getStyleTags());
                influencer.setPersonaStability(dto.getPersonaStability());
                influencer.setCooperationReputation(dto.getCooperationReputation());
                influencer.setFansProfile(new Influencer.FansProfile(
                        dto.getFansProfile().getAge_18_24(),
                        dto.getFansProfile().getAge_25_34(),
                        dto.getFansProfile().getGender_female(),
                        dto.getFansProfile().getCities_tier1(),
                        dto.getFansProfile().getCities_tier2()
                ));
                influencer.setCommentQuality(dto.getCommentQuality());
                influencer.setContentInnovation(dto.getContentInnovation());
                influencer.setPlatformIndex(dto.getPlatformIndex());
                influencer.setPlatformRecommendationProb(dto.getPlatformRecommendationProb());
                influencer.setScores(new Influencer.Scores(
                        dto.getScores().getAdaptability_score(),
                        dto.getScores().getInfluence_score(),
                        dto.getScores().getStickiness_score(),
                        dto.getScores().getPotential_score()
                ));
                influencer.setPotentialLevel(dto.getPotentialLevel());
                influencer.setPredictionReasons(dto.getPredictionReasons());
                influencer.setPriceRange(dto.getPriceRange());
                influencer.setPriceMin(dto.getPriceMin());
                influencer.setPriceMax(dto.getPriceMax());
                influencer.setVerified(dto.getVerified());
                influencer.setMcn(dto.getMcn());
                influencer.setContact(new Influencer.Contact(
                        dto.getContact().getWechat(),
                        dto.getContact().getEmail(),
                        dto.getContact().getPhone()
                ));
                influencer.setRecentWorks(recentWorks);
                influencer.setTags(dto.getTags());

                influencerRepository.save(influencer);
            }
        } catch (Exception e) {
            log.error("Failed to import file {}: {}", location, e.getMessage(), e);
            // 发生异常时回滚事务（由 @Transactional 处理）
        }
    }
}
