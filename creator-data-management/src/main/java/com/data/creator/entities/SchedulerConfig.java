package com.data.creator.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "scheduler_config")
public class SchedulerConfig {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    private String id;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "cron_expression", nullable = false, length = 128)
    private String cronExpression;

    @Column(name = "last_run_at")
    private OffsetDateTime lastRunAt;

    @Column(name = "last_success_at")
    private OffsetDateTime lastSuccessAt;

    @Column(name = "last_status", length = 32)
    private String lastStatus; // success | failed | stopped

    @Column(name = "last_error")
    private String lastError;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
