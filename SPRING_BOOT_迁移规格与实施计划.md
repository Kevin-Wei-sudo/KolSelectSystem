# Spring Boot 迁移规格与实施计划（更新：PostgreSQL 与 JSON 数据适配）

本文件定义从 Node/Express 迁移到 Spring Boot 的完整接口规范、数据模型对齐、服务设计与联调验收标准，确保与现有前端（/frontend）完全兼容。

更新摘要（本次变更）：
- 数据库采用 PostgreSQL（已在 Spring Boot 配置文件中完成连接配置）。
- 确认并适配资源目录下两份示例数据：
  - `src/main/resources/static/data/mock-data-douyin.json`
  - `src/main/resources/static/data/mock-data-xiaohongshu.json`
- 明确 DataController 的统计接口 `/api/data/stats` 返回字段，完全满足前端 StatsOverview 组件需求：`total, highPotentialCount, avgFollowers, platformStats, lastUpdate`。
- 统一 JSON 字段命名返回为 `snake_case`，导入时兼容 `camelCase`（通过 `@JsonAlias`）。
- 针对数据差异与缺失项给出 Demo 级补齐策略（趋势、画像、联系方式占位等）。

---

## 1. 目标与范围
- 在 `creator-data-management` 项目内实现与旧后端一致的 `/api` 前缀接口。
- 覆盖模块：达人（搜索/详情/对比/选项/统计）、NLP（建议/智能搜索）、爬虫（启动/状态/停止/重置）、定时任务（启用/禁用/配置/预设/触发）、数据（统计/重载）。
- 保持前端约定的字段命名（snake_case）与统一响应结构 `{ success, data, total?, message? }`。
- 使用 PostgreSQL 作为持久化数据库。

## 2. 环境与全局配置

### 2.1 Spring Boot 配置（示例）
> 注：你已在配置文件中完成 PostgreSQL 连接，这里提供建议项与占位示例，开发环境以 `application-dev.properties` 为例。

```properties
# 数据源（PostgreSQL）
spring.datasource.url=jdbc:postgresql://<HOST>:<PORT>/<DB_NAME>
spring.datasource.username=<USERNAME>
spring.datasource.password=<PASSWORD>
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

# 全局 JSON 命名策略（已启用）
spring.jackson.property-naming-strategy=SNAKE_CASE

# CORS（如需）
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

说明：
- `ddl-auto=update` 便于快速迭代 Demo；生产建议使用 `validate` 或迁移脚本。
- `SNAKE_CASE` 仅影响 JSON 序列化/反序列化；DB 列命名由 Hibernate 策略决定，如需强制蛇形可在实体使用 `@Column(name="followers_count")`。

### 2.2 统一响应类（已创建）
`com.data.creator.dto.ApiResponse<T>`：
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private Long total;
    private String message;
    public static <T> ApiResponse<T> ok(T data) { /* ... */ }
    public static <T> ApiResponse<T> ok(T data, long total) { /* ... */ }
    public static <T> ApiResponse<T> fail(String message) { /* ... */ }
}
```

## 3. 数据来源与导入策略（JSON → PostgreSQL）

### 3.1 数据文件
- `src/main/resources/static/data/mock-data-douyin.json`
- `src/main/resources/static/data/mock-data-xiaohongshu.json`

这两份 JSON 数据字段接近前端需求，适合作为 Demo 数据源。无需修改原始 JSON 文件，通过导入适配器完成实体映射与缺失项补齐。

### 3.2 字段映射与差异处理
为保证与前端一致，实体输出字段为 `snake_case`，导入 JSON 时兼容 `camelCase`：
- 命名映射（示例）：
  - `ageRange` → `age_range`
  - `followersCount` → `followers_count`
  - `avgViews` → `avg_views`
  - `publishFrequency30d` → `publish_frequency_30d`
  - `publishFrequency90d` → `publish_frequency_90d`
  - `explosiveContentCount` → `explosive_content_count`
  - `fansGrowthTrend` → `fans_growth_trend`
  - `potentialLevel` → `potential_level`
  - `recentWorks` → `recent_works`
  - `styleTags` → `tags`
  - `priceMin` → `price_min`，`priceMax` → `price_max`，`priceRange` → `price_range`
- `id`：JSON 未提供，导入时生成（UUID 或数据库自增）。
- `avatar`：为空时可填充占位图 URL（静态资源）。
- `category`：JSON 为数组，实体保留 `categories: [string]`；卡片展示字段 `category` 可取首项或拼接。
- `contact`：JSON 提供布尔值（是否可提供）。为便于前端展示，转换为字符串：
  - `true` → "可提供"；`false` → `null`（或不返回）。
- 趋势与画像（Demo 补齐）：
  - `followers_trend`：以 `followers_count` 为基准生成 30 天 ±1% 平滑波动数据。
  - `views_trend`：以 `avg_views` 为基准生成 30 天 ±5% 波动数据。
  - `fans_profile`：基于 `gender/age_range/location/styleTags` 生成简版画像（性别/年龄分布、top_cities、interests）。
- 评分与等级：
  - `scores`（`adaptability_score,influence_score,stickiness_score,potential_score`）直接使用 JSON。
  - `potential_level`：保留（S+/S/A/B+ 等）。
- 比较页附加字段：
  - `cooperation_reputation`：JSON 顶层字段保留并映射。

建议在 Raw DTO 上使用 `@JsonAlias` 以兼容导入：
```java
public class RawInfluencerDTO {
    @JsonAlias("followersCount")
    private Long followers_count;
    @JsonAlias("avgViews")
    private Long avg_views;
    // ... 其余别名同上
}
```

### 3.3 导入流程
- DataImportService：读取两份 JSON → 合并数据集 → 字段映射与补齐 → 持久化到 PostgreSQL。
- `/api/data/reload`：清空相关表（或软删除）后重新导入，返回导入统计与 `lastUpdate`。
- 初次启动可自动执行一次导入（条件：表为空）。

## 4. 数据模型与字段对齐

使用现有 `Influencer` 实体（或 DTO 输出）并保证字段与前端一致：
- 基础：`id,name,avatar,platform,category,categories[],gender,age_range,location,verified,mcn,price_min,price_max,price_range,tags[]`
- 核心：`followers_count,avg_views,engagement_rate,completion_rate,publish_frequency_30d,publish_frequency_90d,explosive_content_count,fans_growth_trend`
- 嵌套：`fans_profile`（年龄、性别、城市分布）、`scores`（四维评分）、`contact`（wechat/email/phone）
- 趋势与作品：`followers_trend,views_trend,recent_works`
- 商单与潜力：`cooperation_history,cooperation_reputation,prediction_reasons,potential_level`

说明：若 `FansProfile` 字段不足以表达前端图表，可采用 Map 或补充字段；数值类型按实际数据选择 Long/BigDecimal。

## 5. 接口定义概览（/api 前缀）

### 5.1 数据模块 `/api/data`
- GET `/data/stats`
  - 响应（满足 StatsOverview.jsx）：
    ```json
    {
      "success": true,
      "data": {
        "total": 1234,
        "highPotentialCount": 321,
        "avgFollowers": 45678,
        "platformStats": { "抖音": 500, "小红书": 734 },
        "lastUpdate": "2025-10-23T12:34:56Z"
      }
    }
    ```
- POST `/data/reload` → 重新导入 JSON 数据到 PostgreSQL → `{ success: true, data: { total, lastUpdate } }`

备注：为兼容部分前端调用，也可提供 GET `/influencers/stats/overview` 返回相同结构。

### 5.2 达人模块 `/api/influencers`
- POST `/influencers/search`
  - 请求体：filters（支持 platform/category/styleTag/gender/potentialLevel/fansGrowthTrend 数组；followersMin/Max；engagementRateMin/completionRateMin；四维评分下限；分页与排序）
  - 响应：`{ success, data: Influencer[], total }`
- GET `/influencers/{id}` → `{ success, data: Influencer }`
- POST `/influencers/compare`
  - 请求体：`{ ids: string[] }`
  - 响应：
    ```json
    {
      "success": true,
      "data": {
        "influencers": [ /* Influencer... */ ],
        "analysis": [
          {
            "influencer_name": "xxx",
            "strengths": ["互动率高"],
            "weaknesses": ["完播率偏低"],
            "recommendation": "适合新品预热"
          }
        ]
      }
    }
    ```
- GET `/influencers/options/filters`
  - 响应：`{ success, data: { platforms, categories, styleTags, genders, potentialLevels, growthTrends } }`

### 5.3 NLP 模块 `/api/nlp`
- GET `/nlp/suggestions` → `{ success, data: string[] }`
- POST `/nlp/search`
  - 请求体：`{ query: string }`
  - 响应：
    ```json
    {
      "success": true,
      "data": {
        "explanation": "解析为平台=小红书，类目=美妆...",
        "recommendations": ["建议提高粉丝下限到2万"],
        "total": 87,
        "influencers": [ /* Influencer... */ ]
      }
    }
    ```

### 5.4 爬虫模块（Demo） `/api/crawler`
- POST `/crawler/start` → `{ success: true }`
- POST `/crawler/stop` → `{ success: true }`
- POST `/crawler/reset` → `{ success: true }`
- GET `/crawler/status`
  - 响应：
    ```json
    {
      "success": true,
      "data": {
        "isRunning": true,
        "currentPlatform": "抖音",
        "progress": 2,
        "total": 4,
        "collected": 158,
        "logs": [ { "timestamp": "...", "type": "success", "message": "..." } ]
      }
    }
    ```

### 5.5 定时任务模块（Demo） `/api/scheduler`
- GET `/scheduler/config` → `{ success, data: { enabled, cronExpression, nextRun, lastRun } }`
- GET `/scheduler/presets` → `{ success, data: [ { label, value, description }... ] }`
- POST `/scheduler/enable`（请求体：`{ cronExpression }`）→ 同 `/scheduler/config`
- POST `/scheduler/disable` → 同 `/scheduler/config`（`enabled=false`）
- POST `/scheduler/trigger` → `{ success: true }`

## 6. 服务设计要点

- DataImportService：
  - 从两份 JSON 文件读取，合并，执行字段映射与补齐，落库 PostgreSQL。
  - 提供导入统计（总数、平台分布、最后更新时间）。
- InfluencerService：
  - 筛选、分页与排序、详情、对比分析、筛选选项、概览统计。
  - 对比分析调用 `AiScoringService`（Demo：基于已有指标生成简单结论）。
- AiScoringService：
  - 四维评分与潜力等级（若缺失时可根据已有指标估算）。
  - 生成 Compare 页的优势/劣势/建议文案。
- NlpService：
  - 提供建议列表；`parse(query)` 规则解析为 filters；`explain(filters)` 生成解释与建议；`search(query)` 聚合解析与达人搜索。
- CrawlerService（Demo）：
  - 内存模拟状态；按平台迭代采集，累加 collected 并写入日志；支持 `stop/reset/status`。
- SchedulerService（Demo）：
  - 基于 `TaskScheduler/CronTrigger` 启用/禁用；维护 `nextRun/lastRun`；返回 `presets`；`trigger()` 调用爬虫执行。

## 7. 错误处理与响应约定
- 统一返回：`{ success, data?, total?, message? }`
- 业务错误：`{ success:false, message:"原因" }`
- 参数校验：`ids` 数量（2-5）；分页范围；Cron 表达式格式校验。
- 数据导入异常：记录错误并返回失败信息；部分记录失败不影响整体写入（可按需启用事务批量）。

## 8. 验收标准（联调清单）
- SearchPage：高级筛选与排序/分页正常；导出 Excel 成功。
- NaturalLanguageSearch：建议显示；解释与智能搜索结果一致；显示总数。
- DetailPage：四维评分雷达图、粉丝画像、趋势、作品、商单历史展示完整。
- ComparePage：基础信息对比表、雷达图、AI 分析卡片、导出 Excel 正常。
- CrawlerPage：启动→轮询→完成→日志滚动；停止/重置有效；定时任务开关/预设/配置显示正确；手动触发完成提示。
- StatsOverview：统计卡片与 `lastUpdate` 正确更新；刷新后总数变化与概览一致。

## 9. 实施计划与待办事项
- 已完成：
  - 全局 JSON 命名（snake_case）
  - 统一响应类 `ApiResponse<T>`
  - PostgreSQL 连接配置（由你提供）
  - JSON 数据源核查与适配策略（见第 3 节）
- 待完成（按优先级）：
  - 高：DataController/Service（`/api/data/stats`, `/api/data/reload`，导入两份 JSON → PostgreSQL）
  - 高：InfluencerController/Service（搜索、详情、对比、筛选选项、统计概览）
  - 中：NLPController 与 NlpService（建议与自然语言搜索解析）
  - 中：CrawlerController 与 CrawlerService（模拟爬取、状态、重置、停止）
  - 中：SchedulerController 与 SchedulerService（启用/禁用、配置、预设、手动触发）
  - 高：端到端联调与前端自测（Search/NLP/Compare/Crawler/Scheduler/Stats 页面）

## 10. 参考与样例
- 配置：`src/main/resources/application-dev.properties`
- 数据：`src/main/resources/static/data/mock-data-douyin.json`、`src/main/resources/static/data/mock-data-xiaohongshu.json`
- 现有实体与仓库：`Influencer.java`, `InfluencerRepository.java`
- 前端接口使用位置：`frontend/src/services/api.js`、各页面与组件（Search/NLP/Detail/Compare/Crawler/Stats）

---

附注：如需将此规格拆分到 `docs/` 目录或补充更详细的示例（完整 JSON/代码片段），请告诉我，我可以进一步完善。