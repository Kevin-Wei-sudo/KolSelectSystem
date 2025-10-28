package com.data.creator.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrawlerService {

    private final DataImportService dataImportService;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final AtomicInteger progress = new AtomicInteger(0);
    private final AtomicInteger collected = new AtomicInteger(0);
    private volatile String currentPlatform = null;
    private final List<CrawlerLog> logs = Collections.synchronizedList(new ArrayList<>());

    private static final String[] PLATFORMS = {"抖音"};
    private static final int TOTAL_PLATFORMS = PLATFORMS.length;
    private static final int TOTAL_INFLUENCERS = 20; // 总共要爬取的达人数量


    public synchronized CompletableFuture<Void> start() {
        if (isRunning.get()) {
            throw new RuntimeException("爬虫正在运行中，请勿重复启动");
        }

        // 重置状态
        reset();
        isRunning.set(true);

        addLog("info", "爬虫启动", "开始执行数据采集任务...");

        return CompletableFuture.runAsync(() -> {
            try {
                // 模拟爬取各个平台
                for (int i = 0; i < TOTAL_PLATFORMS; i++) {
                    if (!isRunning.get()) {
                        addLog("warning", "任务中断", "爬虫任务被手动停止");
                        return;
                    }

                    currentPlatform = PLATFORMS[i];
                    addLog("info", "开始爬取", "正在爬取 " + currentPlatform + " 平台数据...");

                    // 模拟爬取时间
                    try {
                        Thread.sleep(2000 + (long)(Math.random() * 3000)); // 2-5秒随机延迟
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }

                    try {
                        addLog("info", "数据处理", "正在处理和保存数据到数据库...");

                        // 使用回调来实时更新进度
                        dataImportService.importFile((message, currentCount) -> {
                            addLog("info", "处理进度", message);
                            collected.set(currentCount);
                            progress.set(currentCount); // 进度基于已处理的达人数量

                            // 每次回调后等待0.5秒
                            try {
                                Thread.sleep(500);
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                            }
                        });

                        collected.set(TOTAL_INFLUENCERS);
                        progress.set(TOTAL_INFLUENCERS); // 进度完成
                        addLog("success", "数据保存成功", "成功保存 " + TOTAL_INFLUENCERS + " 个达人数据到数据库");
                    } catch (Exception e) {
                        log.error("数据导入失败", e);
                        addLog("error", "数据保存失败", "保存数据时发生错误: " + e.getMessage());
                    }

                    // progress 现在由回调函数更新，不需要在这里递增
                }

                // 完成
                currentPlatform = null;
                addLog("success", "爬取完成",
                        String.format("🎉 所有平台爬取完成！共采集 %d 个达人数据", collected.get()));

            } catch (Exception e) {
                log.error("爬虫执行异常", e);
                addLog("error", "执行异常", "爬虫执行过程中发生错误: " + e.getMessage());
            } finally {
                isRunning.set(false);
                currentPlatform = null;
            }
        });
    }

    public synchronized void stop() {
        if (isRunning.get()) {
            isRunning.set(false);
            currentPlatform = null;
            addLog("warning", "手动停止", "爬虫任务已被手动停止");
        }
    }

    public synchronized void reset() {
        isRunning.set(false);
        progress.set(0);
        collected.set(0);
        currentPlatform = null;
        logs.clear();
    }

    public CrawlerStatus getStatus() {
        return new CrawlerStatus(
                isRunning.get(),
                currentPlatform,
                progress.get(),
                TOTAL_INFLUENCERS, // 总数现在是达人数量而不是平台数量
                collected.get(),
                new ArrayList<>(logs)
        );
    }

    private void addLog(String type, String title, String message) {
        logs.add(new CrawlerLog(type, title, message, LocalDateTime.now()));
        log.info("[{}] {}: {}", type.toUpperCase(), title, message);
    }

    // 内部类
    public static class CrawlerStatus {
        private final boolean isRunning;
        private final String currentPlatform;
        private final int progress;
        private final int total;
        private final int collected;
        private final List<CrawlerLog> logs;

        public CrawlerStatus(boolean isRunning, String currentPlatform, int progress,
                             int total, int collected, List<CrawlerLog> logs) {
            this.isRunning = isRunning;
            this.currentPlatform = currentPlatform;
            this.progress = progress;
            this.total = total;
            this.collected = collected;
            this.logs = logs;
        }

        // Getters
        public boolean isRunning() { return isRunning; }
        public String getCurrentPlatform() { return currentPlatform; }
        public int getProgress() { return progress; }
        public int getTotal() { return total; }
        public int getCollected() { return collected; }
        public List<CrawlerLog> getLogs() { return logs; }
    }

    public static class CrawlerLog {
        private final String type;
        private final String title;
        private final String message;
        private final LocalDateTime timestamp;

        public CrawlerLog(String type, String title, String message, LocalDateTime timestamp) {
            this.type = type;
            this.title = title;
            this.message = message;
            this.timestamp = timestamp;
        }

        // Getters
        public String getType() { return type; }
        public String getTitle() { return title; }
        public String getMessage() { return message; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
}