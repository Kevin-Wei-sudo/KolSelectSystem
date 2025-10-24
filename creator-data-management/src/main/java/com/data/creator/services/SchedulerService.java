package com.data.creator.services;

import com.data.creator.entities.SchedulerConfig;
import com.data.creator.repositories.SchedulerConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ScheduledFuture;

@Slf4j
@Service
public class SchedulerService {

    private static final String SCHEDULER_ID = "crawler_main";

    private final TaskScheduler taskScheduler;
    private final CrawlerService crawlerService;
    private final SchedulerConfigRepository schedulerConfigRepository;

    private ScheduledFuture<?> scheduledFuture;

    public SchedulerService(TaskScheduler taskScheduler,
                            CrawlerService crawlerService,
                            SchedulerConfigRepository schedulerConfigRepository) {
        this.taskScheduler = taskScheduler;
        this.crawlerService = crawlerService;
        this.schedulerConfigRepository = schedulerConfigRepository;
    }

    public Map<String, Object> config() {
        SchedulerConfig sc = schedulerConfigRepository.findById(SCHEDULER_ID).orElse(null);
        Map<String, Object> c = new LinkedHashMap<>();
        boolean enabled = sc != null && sc.isEnabled();
        String cron = sc != null ? sc.getCronExpression() : "0 0/5 * * * ?";
        c.put("enabled", enabled);
        c.put("cron_expression", cron);
        c.put("last_run_at", sc != null ? sc.getLastRunAt() : null);
        c.put("last_success_at", sc != null ? sc.getLastSuccessAt() : null);
        c.put("last_status", sc != null ? sc.getLastStatus() : null);
        c.put("last_error", sc != null ? sc.getLastError() : null);
        // next_run（按需计算）
        try {
            CronExpression expr = CronExpression.parse(cron);
            ZonedDateTime next = expr.next(ZonedDateTime.now(ZoneId.systemDefault()));
            c.put("next_run", next != null ? next.toOffsetDateTime() : null);
        } catch (Exception e) {
            log.warn("Compute next_run failed: {}", e.getMessage());
            c.put("next_run", null);
        }
        return c;
    }

    public List<Map<String, String>> presets() {
        List<Map<String, String>> list = new ArrayList<>();
        list.add(Map.of("label", "每5分钟", "value", "0 0/5 * * * ?", "description", "每5分钟执行一次"));
        list.add(Map.of("label", "每小时", "value", "0 0 * * * ?", "description", "每小时执行一次"));
        list.add(Map.of("label", "每日2点", "value", "0 0 2 * * ?", "description", "每日凌晨2点执行"));
        return list;
    }

    public synchronized Map<String, Object> enable(String cronExpr) {
        // 取消旧任务
        disableInternal();
        // 更新配置
        SchedulerConfig sc = schedulerConfigRepository.findById(SCHEDULER_ID).orElseGet(() -> {
            SchedulerConfig n = new SchedulerConfig();
            n.setId(SCHEDULER_ID);
            n.setEnabled(true);
            n.setCronExpression(cronExpr);
            n.setUpdatedAt(OffsetDateTime.now());
            return n;
        });
        sc.setEnabled(true);
        sc.setCronExpression(cronExpr);
        sc.setUpdatedAt(OffsetDateTime.now());
        schedulerConfigRepository.save(sc);
        // 添加新调度
        try {
            CronTrigger trigger = new CronTrigger(cronExpr);
            scheduledFuture = taskScheduler.schedule(() -> {
                try {
                    log.info("Scheduler trigger: starting crawler");
                    crawlerService.start();
                    // 触发时间已在 crawlerService 中写 last_run_at
                } catch (Exception e) {
                    log.error("Scheduled run failed: {}", e.getMessage(), e);
                    writeError(e.getMessage());
                }
            }, trigger);
        } catch (Exception e) {
            log.error("Enable scheduler failed: {}", e.getMessage(), e);
            writeError(e.getMessage());
        }
        return config();
    }

    public synchronized Map<String, Object> disable() {
        disableInternal();
        SchedulerConfig sc = schedulerConfigRepository.findById(SCHEDULER_ID).orElse(null);
        if (sc != null) {
            sc.setEnabled(false);
            sc.setUpdatedAt(OffsetDateTime.now());
            schedulerConfigRepository.save(sc);
        }
        return config();
    }

    private void disableInternal() {
        if (scheduledFuture != null) {
            scheduledFuture.cancel(false);
            scheduledFuture = null;
        }
    }

    public void trigger() {
        try {
            crawlerService.start();
        } catch (Exception e) {
            log.error("Manual trigger failed: {}", e.getMessage(), e);
            writeError(e.getMessage());
        }
    }

    private void writeError(String message) {
        try {
            schedulerConfigRepository.findById(SCHEDULER_ID).ifPresent(sc -> {
                sc.setLastStatus("failed");
                sc.setLastError(message);
                sc.setUpdatedAt(OffsetDateTime.now());
                schedulerConfigRepository.save(sc);
            });
        } catch (Exception ex) {
            log.warn("Persist error status failed: {}", ex.getMessage());
        }
    }
}
