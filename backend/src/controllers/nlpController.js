const nlpService = require('../services/nlpService');
const influencerService = require('../services/influencerService');

class NLPController {
  // 自然语言搜索
  async naturalLanguageSearch(req, res) {
    try {
      const { query } = req.body;

      if (!query || query.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '请输入搜索内容'
        });
      }

      // 解析自然语言
      const filters = nlpService.parseQuery(query);
      
      // 生成解释
      const explanation = nlpService.generateExplanation(query, filters);
      
      // 生成推荐建议
      const recommendations = nlpService.generateRecommendations(query);

      // 执行搜索
      filters.page = 1;
      const result = await influencerService.searchInfluencers(filters);

      res.json({
        success: true,
        data: {
          influencers: result.data,
          total: result.total,
          query: query,
          parsedFilters: filters,
          explanation: explanation,
          recommendations: recommendations,
        },
        message: '搜索成功'
      });
    } catch (error) {
      console.error('自然语言搜索错误:', error);
      res.status(500).json({
        success: false,
        message: '搜索失败',
        error: error.message
      });
    }
  }

  // 获取搜索建议
  async getSearchSuggestions(req, res) {
    try {
      const suggestions = [
        '帮我找10个小红书美妆类的女性达人，粉丝在10-50万，互动率要高',
        '找一些抖音美食类的达人，爆款潜力高，粉丝在上升期',
        '推荐几个B站数码类的达人，专业风格，粉丝50万以上',
        '找快手搞笑类达人，性价比高，口碑好',
        '小红书时尚类达人，粉丝20-100万，完播率高',
        '抖音旅游类达人，爆款潜力S级或A级，女性',
        '找一些母婴类达人，亲民风格，商单口碑好',
        '运动健身类达人，男性，粉丝在增长中',
      ];

      res.json({
        success: true,
        data: suggestions,
        message: '获取成功'
      });
    } catch (error) {
      console.error('获取搜索建议错误:', error);
      res.status(500).json({
        success: false,
        message: '获取失败',
        error: error.message
      });
    }
  }
}

module.exports = new NLPController();

