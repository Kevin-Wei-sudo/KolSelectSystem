package com.data.creator.services;

import cn.hutool.core.lang.Snowflake;
import com.data.creator.constants.DouyinConstants;
import com.data.creator.douyin.DouyinGetUserInfoService;
import com.data.creator.douyin.DouyinGetUserVideoService;
import com.data.creator.dto.RawInfluencer;
import com.data.creator.entities.Influencer;
import com.data.creator.repositories.InfluencerRepository;
import com.data.creator.storage.ObsFileStorage;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class DataImportService {

    private final DouyinGetUserInfoService douyinGetUserInfoService;

    private final DouyinGetUserVideoService douyinGetUserVideoService;

    private final InfluencerRepository influencerRepository;

    private final ResourceLoader resourceLoader;

    private final Snowflake snowflake;
    
    private final ObsFileStorage obsFileStorage;

    @FunctionalInterface
    public interface ProgressCallback {
        void onProgress(String message, int currentCount);
    }

    @Transactional
    public void importFile() {
        importFile(null);
    }

//    @Transactional
    public void importFile(ProgressCallback callback) {
        String location = "classpath:static/data/mock-data-douyin.json";
        try {
            ObjectMapper mapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            RawInfluencer[] rawInfluencers = mapper.readValue(resourceLoader.getResource(location).getInputStream(), RawInfluencer[].class);

            for (int i = 0; i < DouyinConstants.SEC_USER_IDS.size(); i++) {
                RawInfluencer dto = rawInfluencers[i];
                
                if (callback != null) {
                    callback.onProgress("正在获取第 " + (i + 1) + " 个达人信息...", i);
                }
                
                JsonNode userInfo = douyinGetUserInfoService.getUserInfo(DouyinConstants.SEC_USER_IDS.get(i));
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
                JsonNode jsonNode = douyinGetUserVideoService.getUserVideo(DouyinConstants.SEC_USER_IDS.get(i), 1).get(0);
                for (int j = 0; j < jsonNode.get("aweme_list").size(); j++) {
                    JsonNode video = jsonNode.get("aweme_list").get(j);
                    if (recentWorks.size() < 10) {
                        if (callback != null) {
                            callback.onProgress("正在爬取第 " + (i + 1) + " 个达人，第 " + (j + 1) + " 条视频数据...", i);
                        }
                        try {
                            // 视频ID
                            String awemeId = video.get("aweme_id").asText("");
                            // 视频链接
                            String videoUrl = video.get("video").get("play_addr").get("url_list").get(2).asText("");
                            // 视频封面
                            String cover = video.get("video").get("cover").get("url_list").get(0).asText("");
                            // 推荐/曝光相关计数（平台内部用法，可能为 0）
                            Integer recommendCount = video.get("statistics").get("recommend_count").asInt();
                            // 评论数
                            Integer commentCount = video.get("statistics").get("comment_count").asInt();
                            // 点赞数
                            Integer diggCount = video.get("statistics").get("digg_count").asInt();
                            // 赞赏/打赏次数（业务可选字段，常见为 0）
                            Integer admireCount = video.get("statistics").get("admire_count").asInt();
                            // 播放量（部分抓取口可能返回 0 或受去重策略影响）
                            Integer playCount = video.get("statistics").get("play_count").asInt();
                            // 转发/分享次数
                            Integer shareCount = video.get("statistics").get("share_count").asInt();
                            // 收藏次数
                            Integer collectCount = video.get("statistics").get("collect_count").asInt();
                            recentWorks.add(new Influencer.Works(
//                                    obsFileStorage.uploadFileByUrlStream(String.format("%s/%s/%s.mp4", uniqueId, awemeId, awemeId), videoUrl),
//                                    obsFileStorage.uploadFileByUrlStream(String.format("%s/%s/%s.jpg", uniqueId, awemeId, awemeId), cover),
                                    videoUrl,
                                    cover,
                                    new Influencer.Works.Statistics(
                                            recommendCount,
                                            commentCount,
                                            diggCount,
                                            admireCount,
                                            playCount,
                                            shareCount,
                                            collectCount
                                    )
                            ));
                        }catch (Exception e) {
                            log.warn("这一条不是视频");
                        }
                    } else {
                        break;
                    }
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
                influencer.setExplosiveContentCount(dto.getExplosiveContentCount());
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
                log.info("成功保存达人数据: {} (ID: {})", nickname, influencer.getId());
                
                if (callback != null) {
                    callback.onProgress("成功保存达人: " + nickname, i + 1);
                }
            }
            
            log.info("数据导入完成");
            if (callback != null) {
                callback.onProgress("数据导入完成", DouyinConstants.SEC_USER_IDS.size());
            }
        } catch (Exception e) {
            log.error("Failed to import file {}: {}", location, e.getMessage(), e);
            // 发生异常时回滚事务（由 @Transactional 处理）
        }
    }

    public void delete() {
        influencerRepository.deleteAll();
    }
}
