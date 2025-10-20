const express = require('express');
const router = express.Router();
const influencerController = require('../controllers/influencerController');

// 筛选达人
router.post('/search', influencerController.searchInfluencers);

// 获取达人详情
router.get('/:id', influencerController.getInfluencerDetail);

// 对比达人
router.post('/compare', influencerController.compareInfluencers);

// 获取筛选选项（用于下拉框等）
router.get('/options/filters', influencerController.getFilterOptions);

// 获取统计信息
router.get('/stats/overview', influencerController.getOverviewStats);

module.exports = router;

