package com.data.creator.config;

import com.data.creator.repositories.InfluencerRepository;
import com.data.creator.services.DataImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataBootstrap implements ApplicationRunner {

    private final InfluencerRepository influencerRepository;
    private final DataImportService dataImportService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            long count = influencerRepository.count();
            if (count == 0) {
                int imported = dataImportService.reloadFromResources();
                log.info("Bootstrap import completed: {} influencers", imported);
            } else {
                log.info("Bootstrap skipped: existing influencers count = {}", count);
            }
        } catch (Exception e) {
            log.error("Bootstrap import failed: {}", e.getMessage(), e);
        }
    }
}
