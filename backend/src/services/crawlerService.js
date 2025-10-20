/**
 * 爬虫服务（演示版本）
 * 模拟从各平台爬取达人数据
 */

const aiScoringService = require('./aiScoringService');

class CrawlerService {
  constructor() {
    this.platforms = [
      { name: '抖音', key: 'douyin', delay: 2000 },
      { name: '小红书', key: 'xiaohongshu', delay: 2500 },
      { name: '快手', key: 'kuaishou', delay: 2000 },
      { name: 'B站', key: 'bilibili', delay: 2200 },
    ];

    this.categories = ['美妆', '时尚', '美食', '旅游', '数码', '运动健身', '母婴', '教育', '家居', '游戏', '搞笑', '音乐', '舞蹈'];
    this.crawlStatus = {
      isRunning: false,
      currentPlatform: null,
      progress: 0,
      total: 0,
      collected: 0,
      logs: [],
    };
  }

  /**
   * 开始爬取
   */
  async startCrawling(params = {}) {
    if (this.crawlStatus.isRunning) {
      throw new Error('爬虫正在运行中');
    }

    this.crawlStatus = {
      isRunning: true,
      currentPlatform: null,
      progress: 0,
      total: this.platforms.length,
      collected: 0,
      logs: [],
      startTime: new Date(),
    };

    // 添加开始日志
    this.addLog('info', '爬虫系统启动', '开始爬取达人数据...');

    return this.crawlStatus;
  }

  /**
   * 获取爬取状态
   */
  getStatus() {
    return { ...this.crawlStatus };
  }

  /**
   * 模拟爬取平台数据
   */
  async crawlPlatform(platformKey) {
    const platform = this.platforms.find(p => p.key === platformKey);
    if (!platform) {
      throw new Error('平台不存在');
    }

    this.crawlStatus.currentPlatform = platform.name;
    this.addLog('info', `开始爬取${platform.name}`, `正在连接${platform.name}服务器...`);

    // 模拟爬取过程
    await this.delay(500);
    this.addLog('success', `${platform.name}连接成功`, '开始获取达人列表...');

    // 模拟获取达人列表
    const count = Math.floor(Math.random() * 50) + 50; // 50-100个达人
    await this.delay(800);
    this.addLog('success', `发现${count}个达人`, `正在抓取详细数据...`);

    // 模拟抓取详细数据
    for (let i = 0; i < 5; i++) {
      await this.delay(300);
      const current = Math.floor((i + 1) * count / 5);
      this.addLog('info', `抓取进度`, `已获取 ${current}/${count} 个达人数据`);
    }

    this.crawlStatus.collected += count;
    this.crawlStatus.progress++;
    this.addLog('success', `${platform.name}爬取完成`, `成功获取${count}个达人数据`);

    return count;
  }

  /**
   * 停止爬取
   */
  stopCrawling() {
    if (!this.crawlStatus.isRunning) {
      throw new Error('爬虫未在运行');
    }

    this.crawlStatus.isRunning = false;
    this.addLog('warning', '爬虫已停止', '用户手动停止爬取');
  }

  /**
   * 完成爬取
   */
  async completeCrawling() {
    const duration = Math.floor((new Date() - this.crawlStatus.startTime) / 1000);
    this.crawlStatus.isRunning = false;
    this.crawlStatus.currentPlatform = null;
    this.crawlStatus.progress = this.crawlStatus.total;
    
    this.addLog('success', '爬取完成', 
      `总计爬取${this.crawlStatus.collected}个达人数据，用时${duration}秒`);
    
    this.addLog('info', '数据整理中', '正在清洗和标准化数据...');
    
    // 生成新的达人数据
    await this.delay(1000);
    const newInfluencers = await this.generateNewInfluencers(this.crawlStatus.collected);
    
    this.addLog('success', '数据生成完成', `成功生成${newInfluencers.length}个达人数据`);
    
    // 保存到数据文件并重新加载
    await this.saveAndReloadData(newInfluencers);
    
    this.addLog('success', '数据已更新', '新达人已加入筛选列表，可以开始搜索');
    
    return {
      success: true,
      collected: this.crawlStatus.collected,
      duration,
      newInfluencers: newInfluencers.length,
    };
  }

  /**
   * 生成新的达人数据
   */
  async generateNewInfluencers(count) {
    const fs = require('fs');
    const path = require('path');
    
    // 加载数据生成脚本的逻辑
    const newInfluencers = [];
    const existingDataPath = path.join(__dirname, '../../../data/influencers.json');
    let existingData = [];
    
    // 读取现有数据
    if (fs.existsSync(existingDataPath)) {
      const data = fs.readFileSync(existingDataPath, 'utf8');
      existingData = JSON.parse(data);
    }
    
    const startIndex = existingData.length;
    
    // 使用简化的生成逻辑
    for (let i = 0; i < count; i++) {
      const influencer = this.generateOneInfluencer(startIndex + i);
      newInfluencers.push(influencer);
    }
    
    return newInfluencers;
  }

  /**
   * 生成单个达人
   */
  generateOneInfluencer(index) {
    const aiScoringService = require('./aiScoringService');
    
    const platforms = ['抖音', '小红书', '快手', 'B站'];
    const categories = ['美妆', '时尚', '美食', '旅游', '数码', '运动健身', '母婴', '教育', '家居', '游戏', '搞笑', '音乐', '舞蹈'];
    const genders = ['女', '男', '其他'];
    const growthTrends = ['上升', '稳定', '下降'];
    
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
    const randomChoice = (arr) => arr[randomInt(0, arr.length - 1)];
    
    const id = `inf_new_${String(index + 1).padStart(6, '0')}`;
    const platform = randomChoice(platforms);
    const category = randomChoice(categories);
    const gender = randomChoice(genders);
    const growthTrend = randomChoice(growthTrends);
    
    const followersCount = randomInt(10000, 1000000);
    const avgViews = Math.round(followersCount * randomFloat(0.1, 0.8));
    const engagementRate = randomFloat(0.01, 0.15);
    const completionRate = randomFloat(0.3, 0.9);
    const publishFreq30d = randomInt(5, 30);
    const publishFreq90d = randomInt(15, 90);
    const explosiveCount = randomInt(0, 15);
    
    const personaStability = randomFloat(0.6, 0.98);
    const cooperationReputation = randomFloat(0.7, 0.99);
    const commentQuality = randomFloat(0.5, 0.95);
    const contentInnovation = randomFloat(0.3, 0.95);
    const platformIndex = randomFloat(0.5, 0.99);
    const platformRecommendationProb = randomFloat(0.3, 0.95);
    
    const tempInfluencer = {
      followers_count: followersCount,
      avg_views: avgViews,
      engagement_rate: engagementRate,
      completion_rate: completionRate,
      publish_frequency_30d: publishFreq30d,
      publish_frequency_90d: publishFreq90d,
      explosive_content_count: explosiveCount,
      fans_growth_trend: growthTrend,
      persona_stability: personaStability,
      cooperation_reputation: cooperationReputation,
      comment_quality: commentQuality,
      content_innovation: contentInnovation,
      platform_index: platformIndex,
      platform_recommendation_prob: platformRecommendationProb,
      style_tags: ['高端', '专业', '亲民'].slice(0, randomInt(2, 3)),
      fans_profile: {
        age_18_24: randomInt(20, 40),
        age_25_34: randomInt(25, 45),
        gender_female: randomInt(30, 80),
        cities_tier1: randomInt(15, 35),
        cities_tier2: randomInt(25, 40),
      }
    };
    
    const scores = aiScoringService.calculateAllScores(tempInfluencer);
    const potentialLevel = aiScoringService.getPotentialLevel(scores.potential_score);
    const predictionReasons = aiScoringService.generatePredictionReason(tempInfluencer, scores);
    
    return {
      id,
      name: `新达人${index + 1}`,
      avatar: `https://i.pravatar.cc/150?u=${id}`,
      platform,
      category,
      gender,
      age_range: randomChoice(['18-24', '25-30', '31-35']),
      location: randomChoice(['北京', '上海', '广州', '深圳', '杭州']),
      followers_count: followersCount,
      avg_views: avgViews,
      engagement_rate: engagementRate,
      completion_rate: completionRate,
      publish_frequency_30d: publishFreq30d,
      publish_frequency_90d: publishFreq90d,
      explosive_content_count: explosiveCount,
      fans_growth_trend: growthTrend,
      style_tags: tempInfluencer.style_tags,
      persona_stability: personaStability,
      cooperation_reputation: cooperationReputation,
      fans_profile: tempInfluencer.fans_profile,
      comment_quality: commentQuality,
      content_innovation: contentInnovation,
      platform_index: platformIndex,
      platform_recommendation_prob: platformRecommendationProb,
      scores,
      potential_level: potentialLevel,
      prediction_reasons: predictionReasons,
      price_range: followersCount >= 100000 ? '中' : '低',
      price_min: randomInt(5000, 20000),
      price_max: randomInt(30000, 80000),
      verified: Math.random() > 0.5,
      mcn: Math.random() > 0.6 ? randomChoice(['无忧传媒', '谦寻文化']) : null,
      contact: { wechat: true, email: true, phone: true },
      recent_works: [],
      cooperation_history: [],
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * 保存数据并重新加载
   */
  async saveAndReloadData(newInfluencers) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const dataPath = path.join(__dirname, '../../../data/influencers.json');
      
      // 读取现有数据
      let allInfluencers = [];
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        allInfluencers = JSON.parse(data);
      }
      
      // 合并新数据
      allInfluencers = [...allInfluencers, ...newInfluencers];
      
      // 保存到文件
      fs.writeFileSync(dataPath, JSON.stringify(allInfluencers, null, 2), 'utf8');
      
      this.addLog('success', '数据已保存', `数据文件已更新，当前总计${allInfluencers.length}个达人`);
      
      // 通知influencerService重新加载数据
      const influencerService = require('./influencerService');
      influencerService.loadData();
      
      this.addLog('success', '数据已加载', '筛选系统已更新，新达人可以搜索');
      
    } catch (error) {
      this.addLog('error', '数据保存失败', error.message);
      throw error;
    }
  }

  /**
   * 添加日志
   */
  addLog(type, title, message) {
    const log = {
      type, // info, success, warning, error
      title,
      message,
      timestamp: new Date().toISOString(),
    };
    this.crawlStatus.logs.push(log);
    
    // 只保留最近50条日志
    if (this.crawlStatus.logs.length > 50) {
      this.crawlStatus.logs.shift();
    }
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 重置状态
   */
  reset() {
    this.crawlStatus = {
      isRunning: false,
      currentPlatform: null,
      progress: 0,
      total: 0,
      collected: 0,
      logs: [],
    };
  }
}

module.exports = new CrawlerService();

