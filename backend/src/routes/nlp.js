const express = require('express');
const router = express.Router();
const nlpController = require('../controllers/nlpController');

// 自然语言搜索
router.post('/search', nlpController.naturalLanguageSearch);

// 获取搜索建议
router.get('/suggestions', nlpController.getSearchSuggestions);

module.exports = router;

