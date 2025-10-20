/**
 * AI评分服务
 * 实现四维度评分算法：适配度、影响力、粉丝粘性、爆款潜力
 */

class AIScoringService {
  /**
   * 计算适配度评分
   * 基于品牌调性、人设、粉丝画像、商单口碑
   */
  calculateAdaptabilityScore(influencer) {
    let score = 0;

    // 人设稳定性 (0-30分)
    const personaScore = influencer.persona_stability * 30;
    score += personaScore;

    // 粉丝画像匹配度 (0-30分)
    // 假设粉丝年龄在18-35岁之间得分更高
    const targetAgeRate = (influencer.fans_profile.age_18_24 + influencer.fans_profile.age_25_34) / 100;
    const fansProfileScore = targetAgeRate * 30;
    score += fansProfileScore;

    // 商单口碑 (0-25分)
    const reputationScore = influencer.cooperation_reputation * 25;
    score += reputationScore;

    // 风格标签丰富度 (0-15分)
    const styleScore = Math.min(influencer.style_tags.length / 5, 1) * 15;
    score += styleScore;

    return Math.round(score);
  }

  /**
   * 计算影响力评分
   * 基于平台指数、曝光量、粉丝量、发布频率、爆款内容数
   */
  calculateInfluenceScore(influencer) {
    let score = 0;

    // 粉丝量得分 (0-25分)
    // 使用对数scale，避免头部达人占据绝对优势
    const followersScore = Math.min(Math.log10(influencer.followers_count + 1) / 7, 1) * 25;
    score += followersScore;

    // 平均播放量得分 (0-30分)
    const viewsScore = Math.min(Math.log10(influencer.avg_views + 1) / 7, 1) * 30;
    score += viewsScore;

    // 平台指数得分 (0-20分)
    score += influencer.platform_index * 20;

    // 发布频率得分 (0-10分)
    const publishScore = Math.min(influencer.publish_frequency_30d / 30, 1) * 10;
    score += publishScore;

    // 爆款内容数得分 (0-15分)
    const explosiveScore = Math.min(influencer.explosive_content_count / 10, 1) * 15;
    score += explosiveScore;

    return Math.round(score);
  }

  /**
   * 计算粉丝粘性评分
   * 基于完播率、互动率、粉丝增长、评论区质量
   */
  calculateStickinessScore(influencer) {
    let score = 0;

    // 完播率得分 (0-30分)
    const completionScore = influencer.completion_rate * 30;
    score += completionScore;

    // 互动率得分 (0-30分)
    const engagementScore = Math.min(influencer.engagement_rate / 0.15, 1) * 30;
    score += engagementScore;

    // 粉丝增长得分 (0-20分)
    let growthScore = 0;
    if (influencer.fans_growth_trend === '上升') {
      growthScore = 20;
    } else if (influencer.fans_growth_trend === '稳定') {
      growthScore = 15;
    } else {
      growthScore = 5;
    }
    score += growthScore;

    // 评论区质量得分 (0-20分)
    const commentScore = influencer.comment_quality * 20;
    score += commentScore;

    return Math.round(score);
  }

  /**
   * 计算爆款潜力评分（AI核心算法）
   * 基于历史爆款规律、上升趋势、内容创新度、平台推荐概率
   */
  calculatePotentialScore(influencer) {
    let score = 0;

    // 历史爆款率得分 (0-30分)
    const explosiveRate = influencer.explosive_content_count / Math.max(influencer.publish_frequency_90d, 1);
    const explosiveScore = Math.min(explosiveRate / 0.3, 1) * 30;
    score += explosiveScore;

    // 上升趋势得分 (0-25分)
    let trendScore = 0;
    if (influencer.fans_growth_trend === '上升') {
      trendScore = 25;
    } else if (influencer.fans_growth_trend === '稳定') {
      trendScore = 15;
    } else {
      trendScore = 5;
    }
    score += trendScore;

    // 内容创新度得分 (0-20分)
    const innovationScore = influencer.content_innovation * 20;
    score += innovationScore;

    // 平台推荐概率得分 (0-25分)
    const recommendScore = influencer.platform_recommendation_prob * 25;
    score += recommendScore;

    return Math.round(score);
  }

  /**
   * 计算综合评分
   */
  calculateAllScores(influencer) {
    return {
      adaptability_score: this.calculateAdaptabilityScore(influencer),
      influence_score: this.calculateInfluenceScore(influencer),
      stickiness_score: this.calculateStickinessScore(influencer),
      potential_score: this.calculatePotentialScore(influencer)
    };
  }

  /**
   * 生成爆款潜力等级
   */
  getPotentialLevel(potentialScore) {
    if (potentialScore >= 85) return 'S';
    if (potentialScore >= 70) return 'A';
    if (potentialScore >= 55) return 'B';
    return 'C';
  }

  /**
   * 生成AI预测理由
   */
  generatePredictionReason(influencer, scores) {
    const reasons = [];

    // 爆款潜力分析
    if (scores.potential_score >= 80) {
      reasons.push('🔥 近期数据呈强劲上升趋势');
    }
    if (influencer.explosive_content_count > 5) {
      reasons.push(`✨ 近期已产出${influencer.explosive_content_count}个爆款内容`);
    }
    if (influencer.content_innovation > 0.7) {
      reasons.push('💡 内容创新度高，差异化明显');
    }
    if (influencer.platform_recommendation_prob > 0.7) {
      reasons.push('📈 平台推荐概率高，流量获取能力强');
    }

    // 粉丝粘性分析
    if (scores.stickiness_score >= 80) {
      reasons.push('💪 粉丝粘性优秀，互动活跃');
    }
    if (influencer.completion_rate > 0.7) {
      reasons.push(`⏱️ 完播率${(influencer.completion_rate * 100).toFixed(1)}%，内容质量高`);
    }

    // 影响力分析
    if (scores.influence_score >= 80) {
      reasons.push('🌟 影响力强，传播力优秀');
    }

    // 商单口碑
    if (influencer.cooperation_reputation > 0.85) {
      reasons.push('👍 商单口碑好，合作配合度高');
    }

    return reasons.length > 0 ? reasons : ['📊 综合数据表现良好'];
  }

  /**
   * 生成达人对比分析
   */
  generateComparisonAnalysis(influencers) {
    const analysis = influencers.map(inf => {
      const strengths = [];
      const weaknesses = [];

      // 分析优势
      if (inf.scores.potential_score >= 80) {
        strengths.push('爆款潜力极高');
      }
      if (inf.scores.influence_score >= 80) {
        strengths.push('影响力强');
      }
      if (inf.scores.stickiness_score >= 80) {
        strengths.push('粉丝粘性好');
      }
      if (inf.engagement_rate > 0.08) {
        strengths.push('互动率优秀');
      }
      if (inf.cooperation_reputation > 0.85) {
        strengths.push('商单口碑好');
      }

      // 分析劣势
      if (inf.scores.potential_score < 60) {
        weaknesses.push('爆款潜力一般');
      }
      if (inf.engagement_rate < 0.03) {
        weaknesses.push('互动率偏低');
      }
      if (inf.fans_growth_trend === '下降') {
        weaknesses.push('粉丝增长下降');
      }
      if (inf.completion_rate < 0.5) {
        weaknesses.push('完播率待提升');
      }

      // 生成推荐理由
      let recommendation = '';
      if (inf.scores.potential_score >= 80 && inf.scores.stickiness_score >= 75) {
        recommendation = '强烈推荐：爆款潜力高且粉丝粘性好，投放风险低';
      } else if (inf.scores.influence_score >= 85) {
        recommendation = '推荐：影响力强，适合品牌曝光';
      } else if (inf.price_range === '低') {
        recommendation = '性价比之选：价格适中，适合批量投放';
      } else {
        recommendation = '可考虑：综合表现良好';
      }

      return {
        influencer_id: inf.id,
        influencer_name: inf.name,
        strengths: strengths.length > 0 ? strengths : ['数据表现稳定'],
        weaknesses: weaknesses.length > 0 ? weaknesses : ['无明显短板'],
        recommendation
      };
    });

    return analysis;
  }
}

module.exports = new AIScoringService();

