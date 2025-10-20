/**
 * 定时任务服务
 * 管理定时爬虫任务
 */

const cron = require('node-cron');
const crawlerService = require('./crawlerService');

class SchedulerService {
  constructor() {
    this.scheduledTask = null;
    this.config = {
      enabled: false,
      cronExpression: '0 0 * * *', // 默认每天0点
      nextRun: null,
      lastRun: null,
    };
  }

  /**
   * 启用定时任务
   */
  enableSchedule(cronExpression = '0 0 * * *') {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
    }

    // 验证cron表达式
    if (!cron.validate(cronExpression)) {
      throw new Error('无效的cron表达式');
    }

    this.config.cronExpression = cronExpression;
    this.config.enabled = true;

    // 创建定时任务
    this.scheduledTask = cron.schedule(cronExpression, async () => {
      console.log('定时爬虫任务开始执行...');
      this.config.lastRun = new Date().toISOString();
      
      try {
        // 重置爬虫状态（如果之前有残留）
        crawlerService.reset();
        
        // 执行爬虫任务
        await this.executeCrawlingTask();
      } catch (error) {
        console.error('定时爬虫任务执行失败:', error);
      }
    });

    // 计算下次执行时间
    this.updateNextRunTime();

    console.log(`定时爬虫已启用，cron表达式: ${cronExpression}`);
    console.log(`下次执行时间: ${this.config.nextRun}`);

    return this.getConfig();
  }

  /**
   * 禁用定时任务
   */
  disableSchedule() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
    }

    this.config.enabled = false;
    this.config.nextRun = null;

    console.log('定时爬虫已禁用');

    return this.getConfig();
  }

  /**
   * 执行爬虫任务
   */
  async executeCrawlingTask() {
    try {
      // 启动爬虫
      await crawlerService.startCrawling();

      // 依次爬取各平台
      const platforms = ['douyin', 'xiaohongshu', 'kuaishou', 'bilibili'];
      
      for (const platform of platforms) {
        await crawlerService.crawlPlatform(platform);
      }

      // 完成爬取
      const result = await crawlerService.completeCrawling();
      
      console.log(`定时爬虫任务完成，共爬取${result.collected}个达人`);
      
      return result;
    } catch (error) {
      console.error('爬虫任务执行失败:', error);
      throw error;
    }
  }

  /**
   * 更新下次执行时间
   */
  updateNextRunTime() {
    if (!this.config.enabled || !this.scheduledTask) {
      this.config.nextRun = null;
      return;
    }

    // 简化版本：基于cron表达式计算下次执行时间
    const parts = this.config.cronExpression.split(' ');
    const hour = parseInt(parts[1] || '0');
    const minute = parseInt(parts[0] || '0');

    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);

    // 如果今天的时间已过，设置为明天
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    this.config.nextRun = next.toISOString();
  }

  /**
   * 获取配置信息
   */
  getConfig() {
    if (this.config.enabled) {
      this.updateNextRunTime();
    }
    
    return { ...this.config };
  }

  /**
   * 手动触发一次爬虫任务
   */
  async triggerNow() {
    console.log('手动触发爬虫任务...');
    this.config.lastRun = new Date().toISOString();
    
    const result = await this.executeCrawlingTask();
    
    return result;
  }

  /**
   * 预设的cron表达式
   */
  getPresetCronExpressions() {
    return [
      { label: '每天凌晨0点', value: '0 0 * * *', description: '适合日常更新' },
      { label: '每天凌晨2点', value: '0 2 * * *', description: '避开高峰期' },
      { label: '每天早上8点', value: '0 8 * * *', description: '工作时间更新' },
      { label: '每12小时', value: '0 */12 * * *', description: '高频更新' },
      { label: '每6小时', value: '0 */6 * * *', description: '实时性要求高' },
      { label: '每周一凌晨0点', value: '0 0 * * 1', description: '每周更新' },
    ];
  }
}

module.exports = new SchedulerService();

