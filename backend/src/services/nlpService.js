/**
 * 自然语言处理服务
 * 将用户的自然语言描述转换为筛选条件
 */

class NLPService {
  /**
   * 解析自然语言查询
   */
  parseQuery(query) {
    const filters = {};
    const queryLower = query.toLowerCase();

    // 平台识别
    const platforms = {
      '抖音': '抖音',
      'douyin': '抖音',
      '小红书': '小红书',
      'xiaohongshu': '小红书',
      'xhs': '小红书',
      '快手': '快手',
      'kuaishou': '快手',
      'b站': 'B站',
      'bilibili': 'B站',
    };

    for (const [key, value] of Object.entries(platforms)) {
      if (queryLower.includes(key)) {
        filters.platform = [value];
        break;
      }
    }

    // 类目识别
    const categories = ['美妆', '时尚', '美食', '旅游', '数码', '运动健身', '母婴', '教育', '家居', '游戏', '搞笑', '音乐', '舞蹈'];
    for (const category of categories) {
      if (queryLower.includes(category)) {
        if (!filters.category) filters.category = [];
        filters.category.push(category);
      }
    }

    // 性别识别
    if (queryLower.includes('女') || queryLower.includes('女性')) {
      filters.gender = ['女'];
    } else if (queryLower.includes('男') || queryLower.includes('男性')) {
      filters.gender = ['男'];
    }

    // 粉丝量识别
    const fansPatterns = [
      { regex: /(\d+)-(\d+)万粉/, multiplier: 10000 },
      { regex: /(\d+)到(\d+)万/, multiplier: 10000 },
      { regex: /(\d+)万到(\d+)万/, multiplier: 10000 },
      { regex: /(\d+)万-(\d+)万/, multiplier: 10000 },
      { regex: /粉丝.*?(\d+).*?(\d+)万/, multiplier: 10000 },
    ];

    for (const pattern of fansPatterns) {
      const match = query.match(pattern.regex);
      if (match) {
        filters.followersMin = parseInt(match[1]) * pattern.multiplier;
        filters.followersMax = parseInt(match[2]) * pattern.multiplier;
        break;
      }
    }

    // 单个粉丝量识别
    if (!filters.followersMin) {
      const singlePatterns = [
        { regex: /(\d+)万粉以上/, min: true },
        { regex: /超过(\d+)万粉/, min: true },
        { regex: /大于(\d+)万/, min: true },
        { regex: /(\d+)万以下/, max: true },
        { regex: /小于(\d+)万/, max: true },
      ];

      for (const pattern of singlePatterns) {
        const match = query.match(pattern.regex);
        if (match) {
          const value = parseInt(match[1]) * 10000;
          if (pattern.min) {
            filters.followersMin = value;
          } else {
            filters.followersMax = value;
          }
          break;
        }
      }
    }

    // 互动率识别
    const engagementPatterns = [
      /互动率.*?(\d+)%以上/,
      /互动率.*?大于.*?(\d+)%/,
      /互动率.*?超过.*?(\d+)%/,
      /互动.*?高/,
    ];

    for (const pattern of engagementPatterns) {
      const match = query.match(pattern);
      if (match) {
        if (match[1]) {
          filters.engagementRateMin = parseInt(match[1]) / 100;
        } else {
          filters.engagementRateMin = 0.05; // 默认5%
        }
        break;
      }
    }

    // 完播率识别
    const completionPatterns = [
      /完播率.*?(\d+)%以上/,
      /完播率.*?大于.*?(\d+)%/,
      /完播.*?高/,
    ];

    for (const pattern of completionPatterns) {
      const match = query.match(pattern);
      if (match) {
        if (match[1]) {
          filters.completionRateMin = parseInt(match[1]) / 100;
        } else {
          filters.completionRateMin = 0.6; // 默认60%
        }
        break;
      }
    }

    // 爆款潜力识别
    if (queryLower.includes('爆款') || queryLower.includes('潜力') || queryLower.includes('高潜')) {
      filters.potentialLevel = ['S', 'A'];
      if (queryLower.includes('极高') || queryLower.includes('s级')) {
        filters.potentialLevel = ['S'];
      }
    }

    // 增长趋势识别
    if (queryLower.includes('上升') || queryLower.includes('增长') || queryLower.includes('涨粉')) {
      filters.fansGrowthTrend = ['上升'];
    } else if (queryLower.includes('稳定')) {
      filters.fansGrowthTrend = ['稳定'];
    }

    // 风格标签识别
    const styles = ['高端', '亲民', '搞笑', '专业', '文艺', '活泼', '知性', '可爱', '成熟', '潮流', '复古', '简约', '豪华'];
    for (const style of styles) {
      if (queryLower.includes(style)) {
        if (!filters.styleTag) filters.styleTag = [];
        filters.styleTag.push(style);
      }
    }

    // 评分要求识别
    const scorePatterns = [
      { keywords: ['高分', '优秀', '顶级'], scores: { min: 80 } },
      { keywords: ['中等', '一般'], scores: { min: 60 } },
    ];

    for (const pattern of scorePatterns) {
      if (pattern.keywords.some(keyword => queryLower.includes(keyword))) {
        filters.influenceScoreMin = pattern.scores.min;
        filters.adaptabilityScoreMin = pattern.scores.min;
        break;
      }
    }

    // 性价比识别
    if (queryLower.includes('性价比') || queryLower.includes('便宜') || queryLower.includes('实惠')) {
      filters.priceRange = ['低', '中'];
    }

    // 商单口碑识别
    if (queryLower.includes('口碑好') || queryLower.includes('评价高') || queryLower.includes('靠谱')) {
      // 商单口碑评分大于0.85
      filters.cooperationReputationMin = 0.85;
    }

    // 数量识别
    const countMatch = query.match(/(\d+)个/);
    if (countMatch) {
      filters.pageSize = parseInt(countMatch[1]);
    } else {
      filters.pageSize = 20; // 默认20个
    }

    // 默认排序
    if (queryLower.includes('爆款') || queryLower.includes('潜力')) {
      filters.sortBy = 'potential';
    } else if (queryLower.includes('互动') || queryLower.includes('粘性')) {
      filters.sortBy = 'stickiness';
    } else if (queryLower.includes('粉丝') || queryLower.includes('影响力')) {
      filters.sortBy = 'influence';
    } else {
      filters.sortBy = 'influence';
    }
    filters.sortOrder = 'desc';

    return filters;
  }

  /**
   * 生成查询解释
   */
  generateExplanation(query, filters) {
    const parts = [];

    if (filters.platform) {
      parts.push(`平台：${filters.platform.join('、')}`);
    }

    if (filters.category) {
      parts.push(`类目：${filters.category.join('、')}`);
    }

    if (filters.gender) {
      parts.push(`性别：${filters.gender.join('、')}`);
    }

    if (filters.followersMin || filters.followersMax) {
      const min = filters.followersMin ? `${filters.followersMin / 10000}万` : '不限';
      const max = filters.followersMax ? `${filters.followersMax / 10000}万` : '不限';
      parts.push(`粉丝量：${min} - ${max}`);
    }

    if (filters.engagementRateMin) {
      parts.push(`互动率：≥${(filters.engagementRateMin * 100).toFixed(1)}%`);
    }

    if (filters.completionRateMin) {
      parts.push(`完播率：≥${(filters.completionRateMin * 100).toFixed(0)}%`);
    }

    if (filters.potentialLevel) {
      parts.push(`爆款潜力：${filters.potentialLevel.join('、')}级`);
    }

    if (filters.fansGrowthTrend) {
      parts.push(`增长趋势：${filters.fansGrowthTrend.join('、')}`);
    }

    if (filters.styleTag) {
      parts.push(`风格：${filters.styleTag.join('、')}`);
    }

    if (parts.length === 0) {
      return '全部达人';
    }

    return parts.join(' | ');
  }

  /**
   * 生成智能推荐
   */
  generateRecommendations(query) {
    const recommendations = [];

    // 基于查询内容给出建议
    if (query.includes('美妆') || query.includes('化妆')) {
      recommendations.push('建议关注粉丝画像中女性占比和年龄分布');
      recommendations.push('美妆类达人建议选择完播率≥60%的');
    }

    if (query.includes('新品') || query.includes('上市')) {
      recommendations.push('建议选择爆款潜力S/A级的达人');
      recommendations.push('近期数据上升趋势的达人更适合新品推广');
    }

    if (query.includes('大促') || query.includes('活动')) {
      recommendations.push('建议提前1-2周布局，选择发布频率高的达人');
      recommendations.push('可以选择多个腰部达人组合投放');
    }

    if (query.includes('种草')) {
      recommendations.push('建议选择互动率≥8%的达人');
      recommendations.push('粉丝粘性评分≥75分的效果更好');
    }

    return recommendations;
  }
}

module.exports = new NLPService();

