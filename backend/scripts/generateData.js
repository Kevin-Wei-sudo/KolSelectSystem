/**
 * 生成模拟达人数据
 * 生成1000+个达人的完整数据
 */

const fs = require('fs');
const path = require('path');

// 配置
const TOTAL_COUNT = 1200; // 生成1200个达人

// 数据字典
const PLATFORMS = ['抖音', '小红书', '快手', 'B站'];
const CATEGORIES = ['美妆', '时尚', '美食', '旅游', '数码', '运动健身', '母婴', '教育', '家居', '游戏', '搞笑', '音乐', '舞蹈'];
const STYLE_TAGS = ['高端', '亲民', '搞笑', '专业', '文艺', '活泼', '知性', '可爱', '成熟', '潮流', '复古', '简约', '豪华'];
const GENDERS = ['女', '男', '其他'];
const GROWTH_TRENDS = ['上升', '稳定', '下降'];
const PRICE_RANGES = ['低', '中', '高'];

// 姓氏和名字库
const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗'];
const NAMES = ['婷', '娜', '丽', '芳', '静', '敏', '艳', '莉', '梅', '燕', '伟', '强', '磊', '军', '勇', '杰', '涛', '波', '超', '鹏', '欣', '怡', '萌', '琪', '雯'];
const PREFIXES = ['爱', '小', '大', '甜', '酷', '美', '帅', '萌', '超级', '可爱', '快乐', '阳光'];
const SUFFIXES = ['说', '聊', '谈', '记', '日记', '分享', '笔记', '课堂', '时间', '世界', '生活', '故事'];

// 品牌库（用于商单历史）
const BRANDS = [
  '雅诗兰黛', '兰蔻', '欧莱雅', '资生堂', '完美日记', '花西子', '薇诺娜',
  '耐克', '阿迪达斯', '安踏', '李宁', 'ZARA', 'H&M', '优衣库',
  '华为', '小米', '苹果', 'OPPO', 'VIVO', '戴森', '飞利浦',
  '海底捞', '星巴克', '喜茶', '奈雪的茶', '麦当劳', '肯德基',
  '携程', '去哪儿', '飞猪', 'Airbnb', '希尔顿', '万豪'
];

// 生成随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机浮点数
function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// 从数组中随机选择
function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

// 随机选择多个
function randomChoices(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

// 生成达人名称
function generateName() {
  const type = randomInt(1, 3);
  if (type === 1) {
    // 真实姓名风格
    return randomChoice(SURNAMES) + randomChoice(NAMES) + (Math.random() > 0.7 ? randomChoice(NAMES) : '');
  } else if (type === 2) {
    // 前缀+词+后缀风格
    return randomChoice(PREFIXES) + randomChoice(CATEGORIES) + randomChoice(SUFFIXES);
  } else {
    // 随机组合
    return randomChoice(PREFIXES) + randomChoice(NAMES) + (Math.random() > 0.5 ? randomChoice(SUFFIXES) : '');
  }
}

// 生成粉丝画像
function generateFansProfile() {
  // 生成年龄分布，总和为100
  const age_0_17 = randomInt(5, 20);
  const age_18_24 = randomInt(20, 40);
  const age_25_34 = randomInt(25, 45);
  const age_35_plus = 100 - age_0_17 - age_18_24 - age_25_34;

  return {
    age_0_17,
    age_18_24,
    age_25_34,
    age_35_plus,
    gender_female: randomInt(30, 80),
    gender_male: 0, // 将在后面计算
    cities_tier1: randomInt(15, 35),
    cities_tier2: randomInt(25, 40),
    cities_tier3_plus: 0 // 将在后面计算
  };
}

// 生成数据趋势（最近6个月）
function generateTrend(baseValue, trend) {
  const months = [];
  let value = baseValue * 0.7; // 从70%开始

  for (let i = 0; i < 6; i++) {
    if (trend === '上升') {
      value *= randomFloat(1.02, 1.15); // 每月增长2%-15%
    } else if (trend === '稳定') {
      value *= randomFloat(0.95, 1.05); // 每月波动-5%到+5%
    } else {
      value *= randomFloat(0.90, 0.98); // 每月下降2%-10%
    }
    months.push(Math.round(value));
  }

  return months;
}

// 生成内容作品
function generateWorks(category, avgViews, explosiveCount) {
  const works = [];
  const totalWorks = randomInt(15, 30);

  for (let i = 0; i < totalWorks; i++) {
    const isExplosive = i < explosiveCount;
    const views = isExplosive 
      ? Math.round(avgViews * randomFloat(2.5, 10))
      : Math.round(avgViews * randomFloat(0.3, 1.8));
    
    const likes = Math.round(views * randomFloat(0.03, 0.12));
    const comments = Math.round(views * randomFloat(0.005, 0.025));
    const shares = Math.round(views * randomFloat(0.002, 0.015));

    works.push({
      id: `work_${Date.now()}_${i}`,
      title: generateWorkTitle(category),
      cover: `https://picsum.photos/300/400?random=${Date.now() + i}`,
      publish_date: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views,
      likes,
      comments,
      shares,
      is_explosive: isExplosive,
      is_commercial: Math.random() > 0.7
    });
  }

  return works.sort((a, b) => b.views - a.views);
}

// 生成作品标题
function generateWorkTitle(category) {
  const templates = [
    `${category}分享｜这个太好用了！`,
    `强烈推荐！${category}必买清单`,
    `${category}避雷指南，新手必看`,
    `我的${category}日常Vlog`,
    `${category}测评｜真实体验`,
    `超实用的${category}技巧`,
    `${category}好物推荐`,
    `${category}干货分享`,
  ];
  return randomChoice(templates);
}

// 生成商单历史
function generateCooperationHistory() {
  const history = [];
  const count = randomInt(3, 15);

  for (let i = 0; i < count; i++) {
    const daysAgo = randomInt(30, 365);
    history.push({
      brand: randomChoice(BRANDS),
      cooperation_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: randomChoice(['图文', '视频', '直播', '短视频']),
      views: randomInt(10000, 5000000),
      rating: randomFloat(4.0, 5.0, 1)
    });
  }

  return history.sort((a, b) => new Date(b.cooperation_date) - new Date(a.cooperation_date));
}

// 生成单个达人数据
function generateInfluencer(index) {
  const id = `inf_${String(index + 1).padStart(6, '0')}`;
  const platform = randomChoice(PLATFORMS);
  const category = randomChoice(CATEGORIES);
  const gender = randomChoice(GENDERS);
  const growthTrend = randomChoice(GROWTH_TRENDS);
  
  // 根据等级生成粉丝量
  const tier = randomInt(1, 10);
  let followersCount;
  if (tier <= 2) {
    followersCount = randomInt(1000000, 5000000); // 头部
  } else if (tier <= 5) {
    followersCount = randomInt(100000, 1000000); // 腰部
  } else if (tier <= 8) {
    followersCount = randomInt(10000, 100000); // 尾部
  } else {
    followersCount = randomInt(1000, 10000); // 素人
  }

  const avgViews = Math.round(followersCount * randomFloat(0.1, 0.8));
  const engagementRate = randomFloat(0.01, 0.15);
  const completionRate = randomFloat(0.3, 0.9);
  const publishFreq30d = randomInt(5, 30);
  const publishFreq90d = randomInt(15, 90);
  const explosiveCount = randomInt(0, 15);

  // 生成其他数据
  const personaStability = randomFloat(0.6, 0.98);
  const cooperationReputation = randomFloat(0.7, 0.99);
  const commentQuality = randomFloat(0.5, 0.95);
  const contentInnovation = randomFloat(0.3, 0.95);
  const platformIndex = randomFloat(0.5, 0.99);
  const platformRecommendationProb = randomFloat(0.3, 0.95);

  // 生成粉丝画像
  const fansProfile = generateFansProfile();
  fansProfile.gender_male = 100 - fansProfile.gender_female;
  fansProfile.cities_tier3_plus = 100 - fansProfile.cities_tier1 - fansProfile.cities_tier2;

  // 临时scores对象用于AI评分
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
    style_tags: randomChoices(STYLE_TAGS, randomInt(2, 5)),
    fans_profile: fansProfile
  };

  // 使用AI评分算法计算分数
  const aiScoring = require('../src/services/aiScoringService');
  const scores = aiScoring.calculateAllScores(tempInfluencer);
  const potentialLevel = aiScoring.getPotentialLevel(scores.potential_score);
  const predictionReasons = aiScoring.generatePredictionReason(tempInfluencer, scores);

  // 生成报价
  let priceMin, priceMax, priceRange;
  if (followersCount >= 1000000) {
    priceMin = randomInt(50000, 100000);
    priceMax = randomInt(150000, 500000);
    priceRange = '高';
  } else if (followersCount >= 100000) {
    priceMin = randomInt(10000, 30000);
    priceMax = randomInt(40000, 100000);
    priceRange = '中';
  } else {
    priceMin = randomInt(1000, 5000);
    priceMax = randomInt(6000, 20000);
    priceRange = '低';
  }

  return {
    id,
    name: generateName(),
    avatar: `https://i.pravatar.cc/150?u=${id}`,
    platform,
    category,
    gender,
    age_range: randomChoice(['18-24', '25-30', '31-35', '36-40', '40+']),
    location: randomChoice(['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉', '西安', '南京']),
    
    // 基础数据
    followers_count: followersCount,
    avg_views: avgViews,
    engagement_rate: engagementRate,
    completion_rate: completionRate,
    publish_frequency_30d: publishFreq30d,
    publish_frequency_90d: publishFreq90d,
    explosive_content_count: explosiveCount,
    
    // 趋势数据
    fans_growth_trend: growthTrend,
    followers_trend: generateTrend(followersCount, growthTrend),
    views_trend: generateTrend(avgViews, growthTrend),
    
    // 适配度相关
    style_tags: tempInfluencer.style_tags,
    persona_stability: personaStability,
    cooperation_reputation: cooperationReputation,
    
    // 粉丝画像
    fans_profile: fansProfile,
    
    // 粘性相关
    comment_quality: commentQuality,
    
    // 爆款潜力相关
    content_innovation: contentInnovation,
    platform_index: platformIndex,
    platform_recommendation_prob: platformRecommendationProb,
    
    // AI评分
    scores,
    potential_level: potentialLevel,
    prediction_reasons: predictionReasons,
    
    // 报价
    price_range: priceRange,
    price_min: priceMin,
    price_max: priceMax,
    
    // 认证信息
    verified: Math.random() > 0.3,
    mcn: Math.random() > 0.5 ? randomChoice(['无忧传媒', '谦寻文化', '美ONE', '交个朋友', '大禹网络']) : null,
    
    // 联系方式
    contact: {
      wechat: Math.random() > 0.5,
      email: Math.random() > 0.7,
      phone: Math.random() > 0.6
    },
    
    // 内容作品
    recent_works: generateWorks(category, avgViews, explosiveCount).slice(0, 12),
    
    // 商单历史
    cooperation_history: generateCooperationHistory(),
    
    // 特殊标签
    tags: [],
    
    // 创建时间
    created_at: new Date(Date.now() - randomInt(30, 730) * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };
}

// 主函数
function main() {
  console.log('开始生成模拟数据...');
  console.log(`目标数量: ${TOTAL_COUNT} 个达人`);

  const influencers = [];

  for (let i = 0; i < TOTAL_COUNT; i++) {
    const influencer = generateInfluencer(i);
    
    // 添加特殊标签
    if (influencer.scores.potential_score >= 85) {
      influencer.tags.push('高爆款潜力');
    }
    if (influencer.engagement_rate >= 0.1) {
      influencer.tags.push('高互动');
    }
    if (influencer.cooperation_reputation >= 0.9) {
      influencer.tags.push('商单口碑优');
    }
    if (influencer.price_range === '低' && influencer.scores.influence_score >= 70) {
      influencer.tags.push('高性价比');
    }
    if (influencer.fans_growth_trend === '上升' && influencer.explosive_content_count >= 8) {
      influencer.tags.push('近期爆款');
    }

    influencers.push(influencer);

    if ((i + 1) % 100 === 0) {
      console.log(`已生成 ${i + 1} 个达人数据...`);
    }
  }

  // 保存到文件
  const outputDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'influencers.json');
  fs.writeFileSync(outputPath, JSON.stringify(influencers, null, 2), 'utf8');

  console.log(`\n数据生成完成！`);
  console.log(`文件保存在: ${outputPath}`);
  console.log(`总计: ${influencers.length} 个达人`);
  
  // 统计信息
  const stats = {
    platforms: {},
    categories: {},
    potentialLevels: { S: 0, A: 0, B: 0, C: 0 }
  };

  influencers.forEach(inf => {
    stats.platforms[inf.platform] = (stats.platforms[inf.platform] || 0) + 1;
    stats.categories[inf.category] = (stats.categories[inf.category] || 0) + 1;
    stats.potentialLevels[inf.potential_level]++;
  });

  console.log('\n数据分布统计:');
  console.log('平台分布:', stats.platforms);
  console.log('类目分布:', stats.categories);
  console.log('爆款潜力分布:', stats.potentialLevels);
}

// 运行
main();

