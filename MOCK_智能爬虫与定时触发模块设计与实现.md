# Mock 智能爬虫与定时触发模块设计与实现（Spring Boot）

本文档用于补齐并落地实现前端依赖的爬虫与定时任务相关接口，解决当前点击“启动爬虫”按钮出现 404（/api/crawler/start）的问题。模块以 Demo/Mock 方式实现，不进行真实采集，仅在内存中模拟采集进度、平台轮换与日志输出，并提供可控的定时触发能力。

---

## 1. 目标与范围
- 提供可用的爬虫接口：启动、停止、重置、状态查询。
- 提供定时任务接口：启用/禁用、配置查看、预设列表、手动触发。
- 保持与前端一致的响应结构与命名：统一使用 ApiResponse，字段使用 snake_case。
- 仅做 Mock 演示：不进行真实 HTTP 抓取，不依赖外部服务。

---

## 2. 接口定义（/api 前缀）

### 2.1 爬虫模块 `/api/crawler`
- POST `/crawler/start`
  - 功能：启动 Mock 爬虫（若已在运行则返回提示）。
  - 响应示例：
    ```json
    { "success": true, "data": { "message": "crawler started" } }
    ```
- POST `/crawler/stop`
  - 功能：停止 Mock 爬虫（若未运行则返回提示）。
  - 响应示例：
    ```json
    { "success": true, "data": { "message": "crawler stopped" } }
    ```
- POST `/crawler/reset`
  - 功能：重置状态（进度归零、清空日志、清空计数）。
  - 响应示例：
    ```json
    { "success": true, "data": { "message": "crawler reset" } }
    ```
- GET `/crawler/status`
  - 功能：查询当前状态。
  - 响应示例：
    ```json
    {
      "success": true,
      "data": {
        "is_running": true,
        "current_platform": "抖音",
        "progress": 42,
        "total": 100,
        "collected": 158,
        "logs": [
          { "timestamp": "2025-10-24T12:00:00Z", "type": "info", "message": "crawler started" },
          { "timestamp": "2025-10-24T12:00:01Z", "type": "success", "message": "batch collected: 10" }
        ]
      }
    }
    ```

### 2.2 定时任务模块（Mock）`/api/scheduler`
- GET `/scheduler/config`
  - 返回当前配置（开启持久化时包含最近执行信息）：
    ```json
    {
      "success": true,
      "data": {
        "enabled": true,
        "cron_expression": "0 0/5 * * * ?",
        "next_run": "2025-10-24T12:05:00Z",
        "last_run_at": "2025-10-24T12:00:00Z",
        "last_success_at": "2025-10-24T11:55:00Z",
        "last_status": "success",
        "last_error": null
      }
    }
    ```
- GET `/scheduler/presets`
  - 返回预设列表（label/value/description）：
    ```json
    {
      "success": true,
      "data": [
        { "label": "每5分钟", "value": "0 0/5 * * * ?", "description": "每5分钟执行一次" },
        { "label": "每小时", "value": "0 0 * * * ?", "description": "每小时执行一次" },
        { "label": "每日2点", "value": "0 0 2 * * ?", "description": "每日凌晨2点执行" }
      ]
    }
    ```
- POST `/scheduler/enable`
  - 请求体：`{ "cronExpression": "0 0/5 * * * ?" }`
  - 功能：启用定时任务并应用新的 Cron；任务逻辑为在到点时若爬虫未运行则调用爬虫启动。
  - 响应：同 `/scheduler/config`。
- POST `/scheduler/disable`
  - 功能：禁用定时任务（取消调度）。
  - 响应：同 `/scheduler/config`，`enabled=false`。
- POST `/scheduler/trigger`
  - 功能：手动触发一次（立即调用启动爬虫或输出一次模拟采集日志）。
  - 响应示例：
    ```json
    { "success": true, "data": { "message": "triggered" } }
    ```

---

## 3. 模块设计

### 3.1 CrawlerService（Mock）
- 角色：维护爬虫状态、生成进度与日志、模拟平台轮换。
- 关键字段（内存态）：
  - `isRunning: boolean`
  - `currentPlatform: String`（在【抖音/小红书】之间轮换）
  - `progress: int`（0-100）
  - `total: int`（固定 100）
  - `collected: long`（累计采集量，随机递增）
  - `logs: List<LogItem>`（追加型队列，最多保留 200 条）
  - `lastStarted: OffsetDateTime`
- 运行逻辑：
  - `start()`：若未运行，则设置 isRunning=true；每 500ms 递增 progress（如 +2），当 progress >= 100 自动停止并记录完成日志；每次递增时随机增加 `collected` 并写入日志。
  - `stop()`：设置 isRunning=false，记录停止日志。
  - `reset()`：清空 progress/collected/logs，记录重置日志。
  - `status()`：返回状态结构。
- 并发与幂等：
  - 若已在运行，重复 `start()` 返回提示，不重复启动。
  - `stop()`、`reset()` 在未运行时也允许执行（仅写日志）。

### 3.2 SchedulerService（Mock）
- 角色：管理定时配置与调度，调用 `CrawlerService`。
- 实现建议：
  - 使用 `TaskScheduler` + `CronTrigger` 动态添加/取消任务，无需 `@Scheduled` 注解。
  - 维护字段：`enabled`, `cronExpression`, `nextRun`, `lastRun`, `scheduledFuture`。
  - 逻辑：
    - `enable(cronExpression)`：取消旧任务 → 创建新 CronTrigger → 调度执行体（到点时若爬虫未运行则 `crawlerService.start()`；并更新 `lastRun/nextRun`）。
    - `disable()`：取消 `scheduledFuture`，`enabled=false`。
    - `trigger()`：立即执行一次（不改变 `enabled` 状态）。
    - `config()`：返回当前配置。
    - `presets()`：返回内置预设（见 2.2）。

### 3.3 控制器与响应
- `CrawlerController`：暴露 `/api/crawler/*`。
- `SchedulerController`：暴露 `/api/scheduler/*`。
- 统一使用 `ApiResponse<T>` 包装返回；字段命名使用 snake_case（由全局 Jackson 配置保证）。

### 3.4 持久化设计（可选/推荐）
- 背景：若希望“下次查看时仍能看到上一次任务的更新时间/结果”，需要跨重启保存运行记录与调度配置。
- 方案（最小化持久化）：新增一张 `scheduler_config` 表，用于保存调度配置与最近一次任务执行信息。
  - 字段建议（snake_case）：
    - `id`（主键，固定值如 `crawler_main`）
    - `enabled`（是否启用调度）
    - `cron_expression`（当前 Cron 表达式）
    - `last_run_at`（最近一次触发时间，不论成功/失败）
    - `last_success_at`（最近一次成功完成时间）
    - `last_status`（最近一次执行结果：`success|failed|stopped`）
    - `last_error`（失败时的错误摘要，可空）
    - `updated_at`（记录更新时间）
  - 读写策略：
    - `enable/disable` 时更新 `enabled/cron_expression/updated_at`。
    - 调度到点或手动 `trigger` 时：写入 `last_run_at`，执行完毕后根据结果写入 `last_status/last_success_at/last_error`，并更新 `updated_at`。
    - `config` 接口从 DB 读取，保证服务重启后仍可显示最近执行信息。
  - `next_run` 可不持久化：在接口返回时基于 Cron 现算（可使用 `CronSequenceGenerator` 或自定义计算）。
- 扩展（生产级）：
  - `crawler_runs`（运行实例表）记录每次执行的开始/结束/状态/计数；
  - `crawler_run_logs`（日志表）记录每次运行的详细日志（注意量与保留策略）。
- 与内存态的融合：
  - `/api/crawler/status` 返回时同时包含内存态（is_running、progress、current_platform、logs）与 DB 持久字段（如 `last_success_at`）。
  - `/api/scheduler/config` 返回 DB 中的持久化字段，以保证跨重启稳定展示。


---

## 4. 数据结构（DTO 示例）

- CrawlerStatus：
  ```json
  {
    "is_running": true,
    "current_platform": "抖音",
    "progress": 42,
    "total": 100,
    "collected": 158,
    "logs": [ { "timestamp": "...", "type": "info", "message": "..." } ]
  }
  ```
- SchedulerConfig（开启持久化时）：
  ```json
  {
    "enabled": true,
    "cron_expression": "0 0/5 * * * ?",
    "next_run": "2025-10-24T12:05:00Z",
    "last_run_at": "2025-10-24T12:00:00Z",
    "last_success_at": "2025-10-24T11:55:00Z",
    "last_status": "success",
    "last_error": null
  }
  ```

---

## 5. 错误处理与边界
- 路径不存在：返回 404（当前问题）。实现控制器后即可消除。
- 并发启动：`start()` 在 `isRunning=true` 时返回 `{ success:true, data:{ message:"already running" } }`。
- 停止/重置未运行：允许执行，记录日志并返回成功。
- Cron 表达式非法：`enable()` 校验失败时返回 `ApiResponse.fail("Invalid cron expression")`。

---

## 6. 实施步骤（按文件）
1) services/CrawlerService.java
   - 字段与方法：`start/stop/reset/getStatus`，内部定时器（`ScheduledExecutorService` 或 `TaskScheduler`）驱动进度与日志生成。
2) services/SchedulerService.java
   - 注入 `TaskScheduler`，维护 `ScheduledFuture` 与配置，提供 `enable/disable/trigger/config/presets`。
   - 开启持久化时：在触发、完成、失败处更新 `scheduler_config` 表的 `last_run_at/last_success_at/last_status/last_error/updated_at`。
3) api/CrawlerController.java
   - 实现 2.1 的四个端点，返回 `ApiResponse`。
4) api/SchedulerController.java
   - 实现 2.2 的五个端点，返回 `ApiResponse`。
5) config/SchedulingConfig.java（可选）
   - 提供 `TaskScheduler` Bean：`ThreadPoolTaskScheduler`，设置线程名、池大小。
6) entities/SchedulerConfig.java（新增）
   - JPA 实体，`@Entity @Table(name = "scheduler_config")`，字段参见 3.4；主键 id 固定值如 `crawler_main`。
7) repositories/SchedulerConfigRepository.java（新增）
   - `CrudRepository<SchedulerConfig, String>`；提供 `findById("crawler_main")` 与保存方法。
8) DataBootstrap（可选）
   - 启动时若 `scheduler_config` 不存在则创建默认行（例如 `enabled=false, cron_expression="0 0/5 * * * ?"`）。
9) 前端联调
   - UI 按钮依次调用 `/api/crawler/start|stop|reset|status`；定时任务页面调用 `/api/scheduler/*`；`status` 轮询间隔建议 1s。
   - 配置页显示 `last_run_at/last_success_at/last_status/last_error`（若开启持久化）。

---

## 7. 验收标准
- 点击“启动爬虫”：返回 200，`status.is_running=true`，`progress` 持续增长并在约 25-60 秒内到 100，日志不断追加。
- 点击“停止爬虫”：`status.is_running=false`，日志出现 `crawler stopped`。
- 点击“重置爬虫”：`progress=0`、`collected=0`、日志清空。
- 定时任务启用：`config.enabled=true`，`next_run` 合理（晚于当前时间）；到点自动触发 `start()`（若未在运行）。
- 手动触发：立即触发一次采集事件或启动（若未在运行），返回 `triggered`。

---

## 8. 代码片段（参考实现骨架）

> 以下为简化骨架，实际实现中需要补充线程安全控制与日志边界处理。

- SchedulingConfig：
```java
@Configuration
public class SchedulingConfig {
  @Bean
  public TaskScheduler taskScheduler() {
    ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
    scheduler.setPoolSize(2);
    scheduler.setThreadNamePrefix("mock-scheduler-");
    scheduler.initialize();
    return scheduler;
  }
}
```

- CrawlerService：
```java
@Service
public class CrawlerService {
  private final List<String> platforms = Arrays.asList("抖音", "小红书");
  private volatile boolean isRunning = false;
  private String currentPlatform = platforms.get(0);
  private int progress = 0;
  private final int total = 100;
  private long collected = 0;
  private final Deque<Map<String,Object>> logs = new ArrayDeque<>();
  private ScheduledFuture<?> runner;
  private final TaskScheduler taskScheduler;

  public CrawlerService(TaskScheduler taskScheduler) { this.taskScheduler = taskScheduler; }

  public synchronized void start() {
    if (isRunning) { addLog("info", "already running"); return; }
    isRunning = true; progress = 0; addLog("info", "crawler started");
    // 轮换平台
    currentPlatform = platforms.get((platforms.indexOf(currentPlatform) + 1) % platforms.size());
    runner = taskScheduler.scheduleAtFixedRate(this::tick, Duration.ofMillis(500));
  }
  private void tick() {
    if (!isRunning) return;
    progress = Math.min(total, progress + 2);
    long inc = ThreadLocalRandom.current().nextInt(5, 15);
    collected += inc; addLog("success", "batch collected: " + inc);
    if (progress >= total) { stop(); addLog("success", "crawler finished"); }
  }
  public synchronized void stop() { isRunning = false; if (runner!=null) runner.cancel(false); addLog("info", "crawler stopped"); }
  public synchronized void reset() { progress = 0; collected = 0; logs.clear(); addLog("info", "crawler reset"); }
  public Map<String,Object> status() {
    Map<String,Object> s = new LinkedHashMap<>();
    s.put("is_running", isRunning);
    s.put("current_platform", currentPlatform);
    s.put("progress", progress);
    s.put("total", total);
    s.put("collected", collected);
    s.put("logs", new ArrayList<>(logs));
    return s;
  }
  private void addLog(String type, String msg) {
    Map<String,Object> item = new LinkedHashMap<>();
    item.put("timestamp", OffsetDateTime.now());
    item.put("type", type); item.put("message", msg);
    logs.addLast(item); while (logs.size() > 200) logs.removeFirst();
  }
}
```

- SchedulerService：
```java
@Service
public class SchedulerService {
  private final TaskScheduler taskScheduler; private final CrawlerService crawlerService;
  private ScheduledFuture<?> scheduled; private boolean enabled = false; private String cron = "0 0/5 * * * ?";
  private OffsetDateTime lastRun; private OffsetDateTime nextRun;
  public SchedulerService(TaskScheduler ts, CrawlerService cs){ this.taskScheduler = ts; this.crawlerService = cs; }
  public Map<String,Object> config(){ Map<String,Object> c=new LinkedHashMap<>(); c.put("enabled", enabled); c.put("cron_expression", cron); c.put("next_run", nextRun); c.put("last_run", lastRun); return c; }
  public List<Map<String,String>> presets(){ /* 返回预设列表 */ return List.of(/* 见接口定义 */); }
  public synchronized Map<String,Object> enable(String cronExpr){ disable(); this.cron = cronExpr; CronTrigger ct = new CronTrigger(cronExpr); scheduled = taskScheduler.schedule(() -> { lastRun = OffsetDateTime.now(); if (!crawlerService.status().get("is_running").equals(true)) crawlerService.start(); }, ct); enabled = true; // nextRun 计算可选：简单置 null 或基于 CronSequenceGenerator 计算
    return config(); }
  public synchronized Map<String,Object> disable(){ if (scheduled!=null) scheduled.cancel(false); enabled=false; return config(); }
  public void trigger(){ crawlerService.start(); }
}
```

- CrawlerController 与 SchedulerController：
```java
@RestController @RequestMapping("/api/crawler")
@RequiredArgsConstructor
public class CrawlerController {
  private final CrawlerService crawlerService;
  @PostMapping("/start") public ApiResponse<Map<String,Object>> start(){ crawlerService.start(); return ApiResponse.ok(Map.of("message","crawler started")); }
  @PostMapping("/stop") public ApiResponse<Map<String,Object>> stop(){ crawlerService.stop(); return ApiResponse.ok(Map.of("message","crawler stopped")); }
  @PostMapping("/reset") public ApiResponse<Map<String,Object>> reset(){ crawlerService.reset(); return ApiResponse.ok(Map.of("message","crawler reset")); }
  @GetMapping("/status") public ApiResponse<Map<String,Object>> status(){ return ApiResponse.ok(crawlerService.status()); }
}

@RestController @RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulerController {
  private final SchedulerService schedulerService;
  @GetMapping("/config") public ApiResponse<Map<String,Object>> config(){ return ApiResponse.ok(schedulerService.config()); }
  @GetMapping("/presets") public ApiResponse<List<Map<String,String>>> presets(){ return ApiResponse.ok(schedulerService.presets()); }
  @PostMapping("/enable") public ApiResponse<Map<String,Object>> enable(@RequestBody Map<String,String> req){ String cron=req.get("cronExpression"); if(cron==null||cron.isEmpty()) return ApiResponse.fail("cronExpression required"); return ApiResponse.ok(schedulerService.enable(cron)); }
  @PostMapping("/disable") public ApiResponse<Map<String,Object>> disable(){ return ApiResponse.ok(schedulerService.disable()); }
  @PostMapping("/trigger") public ApiResponse<Map<String,Object>> trigger(){ schedulerService.trigger(); return ApiResponse.ok(Map.of("message","triggered")); }
}
```

---

## 9. 与前端联调约定
- 前端按钮调用路径：`/api/crawler/start|stop|reset|status`；调度页调用 `/api/scheduler/*`。
- 轮询建议：`/crawler/status` 每 1 秒轮询一次，直到 `progress=100` 或 `is_running=false`。
- 文案约定：message 字段返回固定文案（如 `crawler started`）以便前端提示。

---

## 10. 下一步与执行计划
- 代码落地顺序：SchedulingConfig → CrawlerService → SchedulerService → CrawlerController → SchedulerController（如开启持久化，再加：Entities/Repositories → DataBootstrap）。
- 预计工作量：约 2-3 小时（含自测与前端联调）；开启持久化再加 0.5-1 小时。
- 完成后消除当前 404 报错，按钮可正常使用，状态与日志可视化；并能在重启后保留上一次任务的时间与结果信息。

---

## 11. 附录：PostgreSQL DDL 与 JPA 实体示例

- DDL（scheduler_config）
```sql
CREATE TABLE IF NOT EXISTS scheduler_config (
  id               VARCHAR(64) PRIMARY KEY,
  enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  cron_expression  VARCHAR(128) NOT NULL,
  last_run_at      TIMESTAMPTZ NULL,
  last_success_at  TIMESTAMPTZ NULL,
  last_status      VARCHAR(32) NULL,
  last_error       TEXT NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- JPA 实体（简化示例）
```java
@Entity
@Table(name = "scheduler_config")
public class SchedulerConfig {
  @Id
  private String id;
  private boolean enabled;
  private String cronExpression;
  private OffsetDateTime lastRunAt;
  private OffsetDateTime lastSuccessAt;
  private String lastStatus; // success|failed|stopped
  private String lastError;
  private OffsetDateTime updatedAt;
  // getters/setters
}
```

- Repository
```java
public interface SchedulerConfigRepository extends CrudRepository<SchedulerConfig, String> {}
```

- 启动初始化（可选）
```java
@Component
@RequiredArgsConstructor
public class SchedulerBootstrap {
  private final SchedulerConfigRepository repo;
  @PostConstruct
  public void init(){
    repo.findById("crawler_main").orElseGet(() -> {
      SchedulerConfig sc = new SchedulerConfig();
      sc.setId("crawler_main");
      sc.setEnabled(false);
      sc.setCronExpression("0 0/5 * * * ?");
      sc.setUpdatedAt(OffsetDateTime.now());
      return repo.save(sc);
    });
  }
}
```