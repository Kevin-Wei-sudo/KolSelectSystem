package com.data.creator.services;

import com.data.creator.entities.SchedulerConfig;
import com.data.creator.repositories.SchedulerConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadLocalRandom;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.InputStream;

@Slf4j
@Service
public class CrawlerService {

    private static final String SCHEDULER_ID = "crawler_main";

    private final List<String> platforms = Arrays.asList("抖音", "小红书");
    private volatile boolean isRunning = false;
    private String currentPlatform = platforms.get(0);
    private int progress = 0;
    private final int total = 100;
    private long collected = 0;
    private long datasetTotal = 0;
    // 新增：更真实的日志模拟（按平台与阶段）
    private long douyinTotal = 0;
    private long xhsTotal = 0;
    private long crawledDouyin = 0;
    private long savedDouyin = 0;
    private long crawledXhs = 0;
    private long savedXhs = 0;
    private enum Phase { CONNECT_DOUYIN, CRAWL_DOUYIN, SAVE_DOUYIN, CONNECT_XHS, CRAWL_XHS, SAVE_XHS, FINISHED }
    private Phase phase = Phase.CONNECT_DOUYIN;
    private int subStep = 0; // 每个阶段的子步骤，用于一秒一条日志

    private final Deque<Map<String, Object>> logs = new ArrayDeque<>();
    private ScheduledFuture<?> runner;

    private final TaskScheduler taskScheduler;
    private final SchedulerConfigRepository schedulerConfigRepository;
    private final DataImportService dataImportService;

    public CrawlerService(TaskScheduler taskScheduler, SchedulerConfigRepository schedulerConfigRepository, DataImportService dataImportService) {
        this.taskScheduler = taskScheduler;
        this.schedulerConfigRepository = schedulerConfigRepository;
        this.dataImportService = dataImportService;
    }

    public synchronized void start() {
        if (isRunning) {
            addLog("info", "already running");
            return;
        }
        isRunning = true;
        progress = 0;
        collected = 0;
        crawledDouyin = 0;
        savedDouyin = 0;
        crawledXhs = 0;
        savedXhs = 0;
        phase = Phase.CONNECT_DOUYIN;
        currentPlatform = "抖音";
        addLog("info", "crawler started");
        // 每次启动：清空并重新导入同一批数据
        try {
            int imported = dataImportService.reloadFromResources();
            // 统计每个平台的条数（用于更真实日志）
            douyinTotal = countFromResource("static/data/mock-data-douyin.json");
            xhsTotal = countFromResource("static/data/mock-data-xiaohongshu.json");
            datasetTotal = imported;
            addLog("success", "database cleared & reloaded: " + imported + " influencers");
        } catch (Exception e) {
            addLog("error", "reload failed: " + e.getMessage());
            updateConfigOnError(e.getMessage());
            stopInternal(false);
            return;
        }
        // 持久化：记录触发时间与状态
        updateConfigOnRun();
        // 启动定时日志推进（连接->爬取->保存），按平台顺序
        runner = taskScheduler.scheduleAtFixedRate(this::tick, java.time.Duration.ofMillis(1000));
    }

    private void tick() {
        if (!isRunning) return;
        try {
            switch (phase) {
                case CONNECT_DOUYIN -> {
                    if (subStep == 0) {
                        addLog("info", "正在连接到抖音服务器...");
                        subStep = 1;
                    } else {
                        addLog("success", "抖音连接成功，开始拉取数据");
                        phase = Phase.CRAWL_DOUYIN;
                        subStep = 0;
                    }
                }
                case CRAWL_DOUYIN -> {
                    if (subStep == 0) {
                        addLog("info", "正在爬数据（抖音）...");
                        subStep = 1;
                    } else {
                        long remain = Math.max(0, douyinTotal - crawledDouyin);
                        if (remain > 0) {
                            long inc = Math.min(ThreadLocalRandom.current().nextInt(20, 50), remain);
                            addLog("success", "爬取到了 " + inc + " 条数据（抖音）");
                            crawledDouyin += inc;
                            phase = Phase.SAVE_DOUYIN;
                        } else {
                            addLog("info", "抖音数据爬取完成，共 " + douyinTotal + " 条");
                            currentPlatform = "小红书";
                            phase = Phase.CONNECT_XHS;
                        }
                        subStep = 0;
                    }
                }
                case SAVE_DOUYIN -> {
                    if (subStep == 0) {
                        addLog("info", "正在保存数据（抖音）...");
                        subStep = 1;
                    } else {
                        long inc = Math.min(crawledDouyin - savedDouyin, Math.max(0, douyinTotal - savedDouyin));
                        if (inc > 0) {
                            addLog("success", "已保存 " + inc + " 条到数据库（抖音）");
                            savedDouyin += inc;
                            collected = savedDouyin + savedXhs;
                        }
                        phase = savedDouyin < douyinTotal ? Phase.CRAWL_DOUYIN : Phase.CONNECT_XHS;
                        subStep = 0;
                    }
                }
                case CONNECT_XHS -> {
                    if (subStep == 0) {
                        addLog("info", "正在连接到小红书服务器...");
                        subStep = 1;
                    } else {
                        addLog("success", "小红书连接成功，开始拉取数据");
                        phase = Phase.CRAWL_XHS;
                        subStep = 0;
                    }
                }
                case CRAWL_XHS -> {
                    if (subStep == 0) {
                        addLog("info", "正在爬数据（小红书）...");
                        subStep = 1;
                    } else {
                        long remain = Math.max(0, xhsTotal - crawledXhs);
                        if (remain > 0) {
                            long inc = Math.min(ThreadLocalRandom.current().nextInt(15, 40), remain);
                            addLog("success", "爬取到了 " + inc + " 条数据（小红书）");
                            crawledXhs += inc;
                            phase = Phase.SAVE_XHS;
                        } else {
                            addLog("info", "小红书数据爬取完成，共 " + xhsTotal + " 条");
                            phase = Phase.FINISHED;
                        }
                        subStep = 0;
                    }
                }
                case SAVE_XHS -> {
                    if (subStep == 0) {
                        addLog("info", "正在保存数据（小红书）...");
                        subStep = 1;
                    } else {
                        long inc = Math.min(crawledXhs - savedXhs, Math.max(0, xhsTotal - savedXhs));
                        if (inc > 0) {
                            addLog("success", "已保存 " + inc + " 条到数据库（小红书）");
                            savedXhs += inc;
                            collected = savedDouyin + savedXhs;
                        }
                        phase = savedXhs < xhsTotal ? Phase.CRAWL_XHS : Phase.FINISHED;
                        subStep = 0;
                    }
                }
                case FINISHED -> {
                    addLog("success", "采集完成，共 " + datasetTotal + " 条（抖音 " + douyinTotal + "，小红书 " + xhsTotal + "）");
                    progress = 100;
                    updateConfigOnSuccess();
                    stopInternal(false);
                }
            }
            // 更新整体进度（按已保存条目/总条目）
            long savedTotal = savedDouyin + savedXhs;
            if (datasetTotal > 0 && phase != Phase.FINISHED) {
                progress = (int) Math.min(100, Math.round(((double) savedTotal / datasetTotal) * 100));
            }
        } catch (Exception e) {
            addLog("error", "tick failed: " + e.getMessage());
            updateConfigOnError(e.getMessage());
            stopInternal(false);
        }
    }

    public synchronized void stop() {
        stopInternal(true);
    }

    private void stopInternal(boolean userInitiated) {
        isRunning = false;
        if (runner != null) {
            runner.cancel(false);
            runner = null;
        }
        addLog("info", userInitiated ? "crawler stopped" : "crawler stopped(auto)");
        if (userInitiated) {
            updateConfigOnStopped();
        }
    }

    public synchronized void reset() {
        progress = 0;
        collected = 0;
        crawledDouyin = 0;
        savedDouyin = 0;
        crawledXhs = 0;
        savedXhs = 0;
        phase = Phase.CONNECT_DOUYIN;
        currentPlatform = "抖音";
        logs.clear();
        addLog("info", "crawler reset");
    }

    public Map<String, Object> status() {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("is_running", isRunning);
        s.put("current_platform", currentPlatform);
        s.put("phase", phase.name());
        s.put("progress", progress);
        s.put("total", total);
        s.put("collected", collected);
        s.put("dataset_total", datasetTotal);
        s.put("douyin_total", douyinTotal);
        s.put("xiaohongshu_total", xhsTotal);
        s.put("logs", new ArrayList<>(logs));
        return s;
    }

    private void addLog(String type, String msg) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("timestamp", OffsetDateTime.now());
        item.put("type", type);
        item.put("message", msg);
        logs.addLast(item);
        while (logs.size() > 200) logs.removeFirst();
    }

    // ---------- 持久化相关 ----------
    private void updateConfigOnRun() {
        try {
            SchedulerConfig sc = schedulerConfigRepository.findById(SCHEDULER_ID).orElse(null);
            if (sc == null) {
                sc = new SchedulerConfig();
                sc.setId(SCHEDULER_ID);
                sc.setEnabled(false);
                sc.setCronExpression("0 0/5 * * * ?");
            }
            sc.setLastRunAt(OffsetDateTime.now());
            sc.setLastStatus("running");
            sc.setLastError(null);
            sc.setUpdatedAt(OffsetDateTime.now());
            schedulerConfigRepository.save(sc);
        } catch (Exception e) {
            log.warn("Persist lastRunAt failed: {}", e.getMessage());
        }
    }

    private void updateConfigOnSuccess() {
        try {
            schedulerConfigRepository.findById(SCHEDULER_ID).ifPresent(sc -> {
                sc.setLastSuccessAt(OffsetDateTime.now());
                sc.setLastStatus("success");
                sc.setUpdatedAt(OffsetDateTime.now());
                schedulerConfigRepository.save(sc);
            });
        } catch (Exception e) {
            log.warn("Persist lastSuccessAt failed: {}", e.getMessage());
        }
    }

    private void updateConfigOnStopped() {
        try {
            schedulerConfigRepository.findById(SCHEDULER_ID).ifPresent(sc -> {
                sc.setLastStatus("stopped");
                sc.setUpdatedAt(OffsetDateTime.now());
                schedulerConfigRepository.save(sc);
            });
        } catch (Exception e) {
            log.warn("Persist stopped status failed: {}", e.getMessage());
        }
    }

    private void updateConfigOnError(String error) {
        try {
            schedulerConfigRepository.findById(SCHEDULER_ID).ifPresent(sc -> {
                sc.setLastStatus("failed");
                sc.setLastError(error);
                sc.setUpdatedAt(OffsetDateTime.now());
                schedulerConfigRepository.save(sc);
            });
        } catch (Exception e) {
            log.warn("Persist error status failed: {}", e.getMessage());
        }
    }

    // 统计资源文件条数，便于更真实的日志展示
    private int countFromResource(String classpathLocation) {
        try {
            ClassPathResource resource = new ClassPathResource(classpathLocation);
            try (InputStream is = resource.getInputStream()) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode arr = mapper.readTree(is);
                return arr != null && arr.isArray() ? arr.size() : 0;
            }
        } catch (Exception e) {
            log.warn("Count resource {} failed: {}", classpathLocation, e.getMessage());
            return 0;
        }
    }
}