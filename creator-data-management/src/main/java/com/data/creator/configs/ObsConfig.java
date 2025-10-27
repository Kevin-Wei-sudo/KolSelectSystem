package com.data.creator.configs;

import com.obs.services.ObsClient;
import com.obs.services.exception.ObsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ObsConfig {

    @Value("${huawei.obs.endpoint}")
    private String endpoint;

    @Value("${huawei.obs.accessKey}")
    private String accessKey;

    @Value("${huawei.obs.secretKey}")
    private String secretKey;
    
    @Bean
    public ObsClient obsClient() {
        try {
            return new ObsClient(accessKey, secretKey, endpoint);
        } catch (ObsException e) {
            throw new RuntimeException("创建OBS客户端失败", e);
        }
    }
}
