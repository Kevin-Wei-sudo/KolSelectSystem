import React from 'react';
import { Card, Row, Col, Steps, Tag, Divider, Timeline, Alert } from 'antd';
import {
  ExperimentOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  RocketOutlined,
  BranchesOutlined,
  FunctionOutlined,
} from '@ant-design/icons';
import './AIModelPage.css';

const AIModelPage = () => {
  return (
    <div className="ai-model-page">
      <div className="page-title">
        <ExperimentOutlined style={{ marginRight: 8, fontSize: 28 }} />
        AI评分模型架构
      </div>

      <Alert
        message="系统核心技术"
        description="达人筛号系统采用多模型融合的AI评分体系，通过四个核心模型对达人进行全方位评估，最终生成综合评分和推荐建议。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 模型架构总览 */}
      <Card title="AI模型架构总览" className="card-shadow" style={{ marginBottom: 24 }}>
        <div className="model-flow">
          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: '数据输入层',
                description: '达人基础数据、内容数据、粉丝数据、商单数据',
                icon: <BranchesOutlined />,
              },
              {
                title: '特征工程层',
                description: '数据清洗、标准化、特征提取、向量化',
                icon: <FunctionOutlined />,
              },
              {
                title: '模型计算层',
                description: '四大核心模型并行计算',
                icon: <ThunderboltOutlined />,
                subTitle: (
                  <div className="model-tags">
                    <Tag color="blue">品牌语义匹配</Tag>
                    <Tag color="green">影响力分析</Tag>
                    <Tag color="orange">粉丝粘性</Tag>
                    <Tag color="red">爆款潜质预测</Tag>
                  </div>
                ),
              },
              {
                title: '评分输出层',
                description: '生成四维评分 + AI综合评分 + 推荐理由',
                icon: <RocketOutlined />,
              },
            ]}
          />
        </div>
      </Card>

      {/* 四大核心模型详解 */}
      <Row gutter={[24, 24]}>
        {/* 模型1：品牌语义匹配 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <ThunderboltOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                模型A：品牌语义匹配模型（Embedding）
              </span>
            }
            className="card-shadow model-card"
          >
            <div className="model-content">
              <div className="model-section">
                <h4>📊 模型类型</h4>
                <p>基于BERT的语义嵌入模型（Sentence-BERT）</p>
              </div>

              <div className="model-section">
                <h4>🎯 评估维度</h4>
                <Timeline
                  items={[
                    {
                      children: (
                        <div>
                          <strong>人设稳定性（30分）</strong>
                          <p>分析达人历史内容，计算人设一致性向量距离</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>粉丝画像匹配度（30分）</strong>
                          <p>粉丝年龄、性别、地域与品牌目标用户的余弦相似度</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>商单口碑（25分）</strong>
                          <p>历史合作品牌评分加权平均</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>风格标签丰富度（15分）</strong>
                          <p>内容风格多样性评分</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="model-section">
                <h4>🔬 核心算法</h4>
                <div className="formula-box">
                  <code>
                    适配度评分 = 0.3 × persona_stability<br/>
                    + 0.3 × cosine_similarity(fans_profile, target_audience)<br/>
                    + 0.25 × cooperation_reputation<br/>
                    + 0.15 × style_diversity
                  </code>
                </div>
              </div>

              <div className="model-section">
                <h4>💡 技术特点</h4>
                <ul>
                  <li>使用预训练BERT模型提取语义特征</li>
                  <li>768维向量空间表示达人和品牌特征</li>
                  <li>余弦相似度计算匹配程度</li>
                  <li>支持中文语义理解</li>
                </ul>
              </div>
            </div>
          </Card>
        </Col>

        {/* 模型2：影响力分析 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <RocketOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                模型B：影响力分析模型
              </span>
            }
            className="card-shadow model-card"
          >
            <div className="model-content">
              <div className="model-section">
                <h4>📊 模型类型</h4>
                <p>加权综合评估模型 + 对数归一化</p>
              </div>

              <div className="model-section">
                <h4>🎯 评估维度</h4>
                <Timeline
                  items={[
                    {
                      children: (
                        <div>
                          <strong>粉丝量（25分）</strong>
                          <p>log₁₀(粉丝数+1) / 7 归一化，避免头部达人垄断</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>平均播放量（30分）</strong>
                          <p>内容传播能力的核心指标</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>平台指数（20分）</strong>
                          <p>官方认证和星级评分</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>发布频率（10分）</strong>
                          <p>内容更新稳定性</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>爆款内容数（15分）</strong>
                          <p>产出爆款的能力</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="model-section">
                <h4>🔬 核心算法</h4>
                <div className="formula-box">
                  <code>
                    影响力评分 = 25 × log₁₀(followers+1)/7<br/>
                    + 30 × log₁₀(avg_views+1)/7<br/>
                    + 20 × platform_index<br/>
                    + 10 × min(publish_freq/30, 1)<br/>
                    + 15 × min(explosive_count/10, 1)
                  </code>
                </div>
              </div>

              <div className="model-section">
                <h4>💡 技术特点</h4>
                <ul>
                  <li>对数scale处理，平衡头腰尾部达人</li>
                  <li>多维度加权综合评估</li>
                  <li>动态权重调整机制</li>
                  <li>考虑平台差异化指标</li>
                </ul>
              </div>
            </div>
          </Card>
        </Col>

        {/* 模型3：粉丝粘性 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <HeartOutlined style={{ color: '#faad14', marginRight: 8 }} />
                模型C：粉丝粘性模型
              </span>
            }
            className="card-shadow model-card"
          >
            <div className="model-content">
              <div className="model-section">
                <h4>📊 模型类型</h4>
                <p>用户行为分析模型 + NLP情感分析</p>
              </div>

              <div className="model-section">
                <h4>🎯 评估维度</h4>
                <Timeline
                  items={[
                    {
                      children: (
                        <div>
                          <strong>完播率（30分）</strong>
                          <p>视频内容吸引力的直接体现</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>互动率（30分）</strong>
                          <p>点赞率 + 评论率 + 转发率综合指标</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>粉丝增长（20分）</strong>
                          <p>上升趋势加分，下降趋势减分</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>评论区质量（20分）</strong>
                          <p>AI分析真实评论占比和情感倾向</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="model-section">
                <h4>🔬 核心算法</h4>
                <div className="formula-box">
                  <code>
                    粘性评分 = 30 × completion_rate<br/>
                    + 30 × min(engagement_rate/0.15, 1)<br/>
                    + 20 × growth_trend_score<br/>
                    + 20 × comment_quality_score
                  </code>
                </div>
              </div>

              <div className="model-section">
                <h4>💡 技术特点</h4>
                <ul>
                  <li>综合多个互动指标</li>
                  <li>NLP情感分析评论质量</li>
                  <li>识别水军和僵尸粉</li>
                  <li>时间序列分析增长趋势</li>
                </ul>
              </div>
            </div>
          </Card>
        </Col>

        {/* 模型4：爆款潜质预测 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <ThunderboltOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                模型D：爆款潜质预测模型（LSTM）
              </span>
            }
            className="card-shadow model-card model-highlight"
          >
            <div className="model-content">
              <div className="model-section">
                <h4>📊 模型类型</h4>
                <p>LSTM时间序列预测模型 + 随机森林分类器</p>
              </div>

              <div className="model-section">
                <h4>🎯 评估维度</h4>
                <Timeline
                  items={[
                    {
                      children: (
                        <div>
                          <strong>历史爆款率（30分）</strong>
                          <p>LSTM分析过往爆款内容的时序规律</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>上升趋势（25分）</strong>
                          <p>LSTM预测未来3-6个月数据走势</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>内容创新度（20分）</strong>
                          <p>TF-IDF + Word2Vec计算内容差异化</p>
                        </div>
                      ),
                    },
                    {
                      children: (
                        <div>
                          <strong>平台推荐概率（25分）</strong>
                          <p>基于平台算法逆向工程的推荐概率预测</p>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="model-section">
                <h4>🔬 核心算法</h4>
                <div className="formula-box">
                  <code>
                    潜力评分 = 30 × min(explosive_rate/0.3, 1)<br/>
                    + 25 × LSTM_trend_prediction(data_6m)<br/>
                    + 20 × content_innovation_score<br/>
                    + 25 × platform_recommendation_prob
                  </code>
                </div>
              </div>

              <div className="model-section">
                <h4>🧠 LSTM模型架构</h4>
                <div className="lstm-architecture">
                  <div className="lstm-layer">输入层：过去6个月的时序数据</div>
                  <div className="lstm-arrow">↓</div>
                  <div className="lstm-layer">LSTM层1：128个隐藏单元</div>
                  <div className="lstm-arrow">↓</div>
                  <div className="lstm-layer">LSTM层2：64个隐藏单元</div>
                  <div className="lstm-arrow">↓</div>
                  <div className="lstm-layer">Dropout层：防止过拟合</div>
                  <div className="lstm-arrow">↓</div>
                  <div className="lstm-layer">全连接层：输出爆款概率</div>
                </div>
              </div>

              <div className="model-section">
                <h4>💡 技术特点</h4>
                <ul>
                  <li><strong>LSTM时序预测</strong>：捕捉数据的长期依赖关系</li>
                  <li><strong>多特征融合</strong>：整合30+个特征维度</li>
                  <li><strong>动态学习</strong>：模型持续训练优化</li>
                  <li><strong>可解释性</strong>：SHAP值分析特征贡献度</li>
                  <li><strong>准确率70%+</strong>：经过大量真实数据验证</li>
                </ul>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 评分输出与综合评估 */}
      <Card 
        title="评分输出与综合评估" 
        className="card-shadow" 
        style={{ marginTop: 24 }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="output-section">
              <h3>📊 四维评分输出</h3>
              <div className="score-output">
                <div className="score-item">
                  <Tag color="blue" style={{ fontSize: 16, padding: '8px 16px' }}>
                    适配度评分（0-100分）
                  </Tag>
                  <p>品牌与达人的匹配程度</p>
                </div>
                <div className="score-item">
                  <Tag color="green" style={{ fontSize: 16, padding: '8px 16px' }}>
                    影响力评分（0-100分）
                  </Tag>
                  <p>达人的传播能力和覆盖范围</p>
                </div>
                <div className="score-item">
                  <Tag color="orange" style={{ fontSize: 16, padding: '8px 16px' }}>
                    粉丝粘性评分（0-100分）
                  </Tag>
                  <p>粉丝的质量和活跃度</p>
                </div>
                <div className="score-item">
                  <Tag color="red" style={{ fontSize: 16, padding: '8px 16px' }}>
                    爆款潜力评分（0-100分）
                  </Tag>
                  <p>未来产出爆款内容的概率</p>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="output-section">
              <h3>🎯 AI综合评分</h3>
              <div className="comprehensive-score">
                <div className="formula-box">
                  <code>
                    AI综合评分 = <br/>
                    0.25 × 适配度评分 +<br/>
                    0.30 × 影响力评分 +<br/>
                    0.20 × 粉丝粘性评分 +<br/>
                    0.25 × 爆款潜力评分
                  </code>
                </div>
                <Divider />
                <h4>🏆 潜力等级划分</h4>
                <div className="level-tags">
                  <Tag color="#f5222d" style={{ fontSize: 14, padding: '6px 12px' }}>
                    S级：≥85分（极高潜力）
                  </Tag>
                  <Tag color="#fa8c16" style={{ fontSize: 14, padding: '6px 12px' }}>
                    A级：70-84分（高潜力）
                  </Tag>
                  <Tag color="#1890ff" style={{ fontSize: 14, padding: '6px 12px' }}>
                    B级：55-69分（中等潜力）
                  </Tag>
                  <Tag color="#52c41a" style={{ fontSize: 14, padding: '6px 12px' }}>
                    C级：{'<'}55分（基础潜力）
                  </Tag>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider />

        <div className="output-section">
          <h3>💬 AI推荐理由生成</h3>
          <p>基于评分结果，系统自动生成可解释的推荐理由：</p>
          <div className="reasons-example">
            <Alert
              message="示例：AI推荐理由"
              description={
                <ul style={{ marginBottom: 0 }}>
                  <li>🔥 近期数据呈强劲上升趋势（LSTM预测置信度92%）</li>
                  <li>✨ 近期已产出5个爆款内容，爆款率达33%</li>
                  <li>💡 内容创新度高，差异化明显（创新指数0.87）</li>
                  <li>📈 平台推荐概率高（78%），流量获取能力强</li>
                  <li>💪 粉丝粘性优秀，互动率达9.2%</li>
                  <li>👍 商单口碑好，历史合作评分4.8/5.0</li>
                </ul>
              }
              type="success"
              showIcon
            />
          </div>
        </div>
      </Card>

      {/* 技术优势 */}
      <Card 
        title="🚀 系统技术优势" 
        className="card-shadow" 
        style={{ marginTop: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="advantage-card">
              <h4>🎯 科学性</h4>
              <p>多模型融合，全方位评估</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="advantage-card">
              <h4>🤖 智能性</h4>
              <p>LSTM深度学习，预测准确</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="advantage-card">
              <h4>💡 可解释性</h4>
              <p>清晰的评分逻辑和推荐理由</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="advantage-card">
              <h4>🔄 动态性</h4>
              <p>持续学习，模型不断优化</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AIModelPage;

