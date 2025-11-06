const fs = require('fs');
const path = require('path');
const aiScoringService = require('./aiScoringService');

class InfluencerService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../../data/influencers.json');
    this.influencers = [];
    this.loadData();
  }

  // 加载数据
  loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        this.influencers = JSON.parse(data);
        console.log(`已加载 ${this.influencers.length} 个达人数据`);
      } else {
        console.log('数据文件不存在，请先生成数据');
        this.influencers = [];
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      this.influencers = [];
    }
  }

  // 筛选达人
  async searchInfluencers(filters) {
    let results = [...this.influencers];

    // 平台筛选
    if (filters.platform && filters.platform.length > 0) {
      results = results.filter(inf => filters.platform.includes(inf.platform));
    }

    // 类目筛选
    if (filters.category && filters.category.length > 0) {
      results = results.filter(inf => filters.category.includes(inf.category));
    }

    // 粉丝量筛选
    if (filters.followersMin !== undefined) {
      results = results.filter(inf => inf.followers_count >= filters.followersMin);
    }
    if (filters.followersMax !== undefined) {
      results = results.filter(inf => inf.followers_count <= filters.followersMax);
    }

    // 平均播放量筛选
    if (filters.avgViewsMin !== undefined) {
      results = results.filter(inf => inf.avg_views >= filters.avgViewsMin);
    }
    if (filters.avgViewsMax !== undefined) {
      results = results.filter(inf => inf.avg_views <= filters.avgViewsMax);
    }

    // 互动率筛选
    if (filters.engagementRateMin !== undefined) {
      results = results.filter(inf => inf.engagement_rate >= filters.engagementRateMin);
    }

    // 完播率筛选
    if (filters.completionRateMin !== undefined) {
      results = results.filter(inf => inf.completion_rate >= filters.completionRateMin);
    }

    // 粉丝增长筛选
    if (filters.fansGrowthTrend && filters.fansGrowthTrend.length > 0) {
      results = results.filter(inf => filters.fansGrowthTrend.includes(inf.fans_growth_trend));
    }

    // 风格标签筛选
    if (filters.styleTag && filters.styleTag.length > 0) {
      results = results.filter(inf => 
        inf.style_tags.some(tag => filters.styleTag.includes(tag))
      );
    }

    // 性别筛选
    if (filters.gender && filters.gender.length > 0) {
      results = results.filter(inf => filters.gender.includes(inf.gender));
    }

    // 评分筛选
    if (filters.adaptabilityScoreMin !== undefined) {
      results = results.filter(inf => inf.scores.adaptability_score >= filters.adaptabilityScoreMin);
    }
    if (filters.influenceScoreMin !== undefined) {
      results = results.filter(inf => inf.scores.influence_score >= filters.influenceScoreMin);
    }
    if (filters.stickinessScoreMin !== undefined) {
      results = results.filter(inf => inf.scores.stickiness_score >= filters.stickinessScoreMin);
    }
    if (filters.potentialScoreMin !== undefined) {
      results = results.filter(inf => inf.scores.potential_score >= filters.potentialScoreMin);
    }

    // 爆款潜力等级筛选
    if (filters.potentialLevel && filters.potentialLevel.length > 0) {
      results = results.filter(inf => filters.potentialLevel.includes(inf.potential_level));
    }

    // 排序
    if (filters.sortBy) {
      results = this.sortResults(results, filters.sortBy, filters.sortOrder || 'desc');
    }

    // 分页
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedResults = results.slice(start, end);

    return {
      data: paginatedResults,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // 排序结果
  sortResults(results, sortBy, sortOrder) {
    return results.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'followers':
          aValue = a.followers_count;
          bValue = b.followers_count;
          break;
        case 'avgViews':
          aValue = a.avg_views;
          bValue = b.avg_views;
          break;
        case 'engagementRate':
          aValue = a.engagement_rate;
          bValue = b.engagement_rate;
          break;
        case 'adaptability':
          aValue = a.scores.adaptability_score;
          bValue = b.scores.adaptability_score;
          break;
        case 'influence':
          aValue = a.scores.influence_score;
          bValue = b.scores.influence_score;
          break;
        case 'stickiness':
          aValue = a.scores.stickiness_score;
          bValue = b.scores.stickiness_score;
          break;
        case 'potential':
          aValue = a.scores.potential_score;
          bValue = b.scores.potential_score;
          break;
        default:
          aValue = a.scores.influence_score;
          bValue = b.scores.influence_score;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  // 根据ID获取达人详情
  async getInfluencerById(id) {
    return this.influencers.find(inf => this.getInfluencerId(inf) === id);
  }

  // 对比达人
  async compareInfluencers(ids) {
    const influencers = ids
      .map(id => this.influencers.find(inf => this.getInfluencerId(inf) === id))
      .filter(Boolean);
    
    if (influencers.length !== ids.length) {
      throw new Error('部分达人不存在');
    }

    // 生成对比分析
    const analysis = aiScoringService.generateComparisonAnalysis(influencers);

    return {
      influencers,
      analysis
    };
  }

  // 兼容不同数据源的ID字段
  getInfluencerId(inf) {
    return inf?.id ?? inf?.['inf_新编号'] ?? inf?.infId ?? inf?.influencerId ?? null;
  }

  // 获取筛选选项
  async getFilterOptions() {
    const platforms = [...new Set(this.influencers.map(inf => inf.platform))];
    const categories = [...new Set(this.influencers.map(inf => inf.category))];
    const styleTags = [...new Set(this.influencers.flatMap(inf => inf.style_tags))];

    return {
      platforms,
      categories,
      styleTags,
      followersRanges: [
        { label: '1万以下', min: 0, max: 10000 },
        { label: '1-10万', min: 10000, max: 100000 },
        { label: '10-50万', min: 100000, max: 500000 },
        { label: '50-100万', min: 500000, max: 1000000 },
        { label: '100万以上', min: 1000000, max: 999999999 }
      ],
      potentialLevels: ['S', 'A', 'B', 'C'],
      genders: ['女', '男', '其他'],
      growthTrends: ['上升', '稳定', '下降']
    };
  }

  // 获取统计信息
  async getOverviewStats() {
    const total = this.influencers.length;
    const platformStats = {};
    const categoryStats = {};

    this.influencers.forEach(inf => {
      platformStats[inf.platform] = (platformStats[inf.platform] || 0) + 1;
      categoryStats[inf.category] = (categoryStats[inf.category] || 0) + 1;
    });

    const avgFollowers = Math.round(
      this.influencers.reduce((sum, inf) => sum + inf.followers_count, 0) / total
    );

    return {
      total,
      platformStats,
      categoryStats,
      avgFollowers,
      highPotentialCount: this.influencers.filter(inf => inf.potential_level === 'S' || inf.potential_level === 'A').length
    };
  }
}

module.exports = new InfluencerService();

