const express = require('express');
const router = express.Router();
const crawlerController = require('../controllers/crawlerController');

// 开始爬取
router.post('/start', crawlerController.startCrawling);

// 获取爬取状态
router.get('/status', crawlerController.getStatus);

// 停止爬取
router.post('/stop', crawlerController.stopCrawling);

// 重置状态
router.post('/reset', crawlerController.reset);

module.exports = router;

