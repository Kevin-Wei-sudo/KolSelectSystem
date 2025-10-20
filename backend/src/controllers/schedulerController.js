const schedulerService = require('../services/schedulerService');

class SchedulerController {
  // 启用定时任务
  async enableSchedule(req, res) {
    try {
      const { cronExpression } = req.body;
      const config = await schedulerService.enableSchedule(cronExpression);
      
      res.json({
        success: true,
        data: config,
        message: '定时任务已启用'
      });
    } catch (error) {
      console.error('启用定时任务错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 禁用定时任务
  async disableSchedule(req, res) {
    try {
      const config = schedulerService.disableSchedule();
      
      res.json({
        success: true,
        data: config,
        message: '定时任务已禁用'
      });
    } catch (error) {
      console.error('禁用定时任务错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取定时任务配置
  async getConfig(req, res) {
    try {
      const config = schedulerService.getConfig();
      
      res.json({
        success: true,
        data: config,
        message: '获取成功'
      });
    } catch (error) {
      console.error('获取配置错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 手动触发一次
  async triggerNow(req, res) {
    try {
      const result = await schedulerService.triggerNow();
      
      res.json({
        success: true,
        data: result,
        message: '爬虫任务已触发'
      });
    } catch (error) {
      console.error('触发任务错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取预设的cron表达式
  async getPresets(req, res) {
    try {
      const presets = schedulerService.getPresetCronExpressions();
      
      res.json({
        success: true,
        data: presets,
        message: '获取成功'
      });
    } catch (error) {
      console.error('获取预设错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SchedulerController();

