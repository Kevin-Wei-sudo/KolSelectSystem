package com.data.creator.config;

import com.data.creator.entities.SchedulerConfig;
import com.data.creator.repositories.SchedulerConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class SchedulerBootstrap implements ApplicationRunner {

    private final SchedulerConfigRepository schedulerConfigRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            String id = "crawler_main";
            schedulerConfigRepository.findById(id).orElseGet(() -> {
                SchedulerConfig sc = new SchedulerConfig();
                sc.setId(id);
                sc.setEnabled(false);
                sc.setCronExpression("0 0/5 * * * ?");
                sc.setUpdatedAt(OffsetDateTime.now());
                log.info("Initialized default scheduler_config row: id={}", id);
                return schedulerConfigRepository.save(sc);
            });
        } catch (Exception e) {
            log.error("Scheduler bootstrap init failed: {}", e.getMessage(), e);
        }
    }
}
