package com.data.creator.initializer;

import com.data.creator.douyin.DouyinGetUserInfoService;
import com.data.creator.douyin.DouyinGetUserVideoService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Initializer {
    private final DouyinGetUserInfoService douyinGetUserInfoService;
    private final DouyinGetUserVideoService douyinGetUserVideoService;
    @Bean
    public CommandLineRunner initData() {

//        String secUserId = "MS4wLjABAAAA9WHC-IWbX7r5EEI1dbIYIaDqWisiG1kfYxuSC4OaiwLyxEYOYhiGaL77M0pVRRN8";
        String secUserId = "MS4wLjABAAAA8kiQb6tVZpjVEQ6MfXMcGrhrDM-SRYfvkJiOToiJhxu8fvnooz0F3EK0e6dPQFMK";

        return args -> {
            JsonNode userInfo = douyinGetUserInfoService.getUserInfo(secUserId);
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

            // IO.println 打印
            IO.println("===== Douyin User =====");
            IO.println("抖音号(unique_id):     " + uniqueId);
            IO.println("昵称(nickname):        " + nickname);
            IO.println("关注数(followingCount):" + followingCount);
            IO.println("粉丝数(followerCount): " + followerCount);
            IO.println("获赞数(totalFavorited):" + totalFavorited);
            IO.println("头像(avatar):          " + avatar);
            IO.println("=======================");

            JsonNode jsonNode = douyinGetUserVideoService.getUserVideo(secUserId, 1);
            JsonNode userVideo = jsonNode.get(0);
            IO.println("===== Douyin User Videos =====");
            for (JsonNode video : userVideo.get("aweme_list")) {
                // 视频ID
                String awemeId = video.get("aweme_id").asText("");
                // 视频链接
                String videoUrl = video.get("video").get("play_addr").get("url_list").get(2).asText("");
                // 视频封面
                String cover = video.get("video").get("cover").get("url_list").get(0).asText("");
                // 视频评论数
                long commentCount = video.get("statistics").get("comment_count").asLong();
                // 视频播放数
                long playCount = video.get("statistics").get("play_count").asLong();
                // 视频点赞数
                long diggCount = video.get("statistics").get("digg_count").asLong();
                // IO.println 打印
                IO.println("视频ID(awemeId): " + awemeId);
                IO.println("视频链接(videoUrl): " + videoUrl);
                IO.println("视频封面(cover): " + cover);
                IO.println("视频评论数(commentCount): " + commentCount);
                IO.println("视频播放数(playCount): " + playCount);
                IO.println("视频点赞数(diggCount): " + diggCount);
                IO.println("------------------------------");
            }
            IO.println("================================");
        };
    }
}
