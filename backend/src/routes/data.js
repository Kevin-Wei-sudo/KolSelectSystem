const express = require('express');
const router = express.Router();
const influencerService = require('../services/influencerService');

// 重新加载数据
router.post('/reload', (req, res) => {
  try {
    influencerService.loadData();
    res.json({
      success: true,
      message: '数据已重新加载',
      total: influencerService.influencers.length
    });
  } catch (error) {
    console.error('重新加载数据失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取数据统计
router.get('/stats', (req, res) => {
  try {
    const total = influencerService.influencers.length;
    const lastUpdate = influencerService.influencers.length > 0 
      ? influencerService.influencers[influencerService.influencers.length - 1].updated_at
      : null;
    
    res.json({
      success: true,
      data: {
        total,
        lastUpdate
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

