package com.data.creator.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "dateTimeProvider")
public class JpaConfig {
    
    @Bean
    public DateTimeProvider dateTimeProvider() {
        return () -> Optional.of(Instant.now().truncatedTo(ChronoUnit.MILLIS));
    }
}
