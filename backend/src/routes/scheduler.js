const express = require('express');
const router = express.Router();
const schedulerController = require('../controllers/schedulerController');

// 启用定时任务
router.post('/enable', schedulerController.enableSchedule);

// 禁用定时任务
router.post('/disable', schedulerController.disableSchedule);

// 获取定时任务配置
router.get('/config', schedulerController.getConfig);

// 手动触发一次
router.post('/trigger', schedulerController.triggerNow);

// 获取预设的cron表达式
router.get('/presets', schedulerController.getPresets);

module.exports = router;

