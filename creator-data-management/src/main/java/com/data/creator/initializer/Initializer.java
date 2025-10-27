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

            // sout 打印
            IO.println("===== Douyin User =====");
            IO.println("抖音号(unique_id):     " + uniqueId);
            IO.println("昵称(nickname):        " + nickname);
            IO.println("关注数(followingCount):" + followingCount);
            IO.println("粉丝数(followerCount): " + followerCount);
            IO.println("获赞数(totalFavorited):" + totalFavorited);
            IO.println("头像(avatar):          " + avatar);
            IO.println("=======================");
            
             douyinGetUserVideoService.getUserVideo(secUserId);
        };
    }
}
