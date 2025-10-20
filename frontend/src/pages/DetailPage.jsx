import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Space,
  Button,
  Descriptions,
  Tabs,
  Spin,
  message,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CheckCircleFilled,
  PhoneOutlined,
  MailOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import { influencerAPI } from '../services/api';
import {
  formatNumberShort,
  formatPercent,
  formatPriceRange,
  getPotentialLevelText,
  getPotentialLevelColor,
} from '../utils/format';
import ScoreRadarChart from '../components/Detail/ScoreRadarChart';
import TrendChart from '../components/Detail/TrendChart';
import FansProfileChart from '../components/Detail/FansProfileChart';
import WorksGallery from '../components/Detail/WorksGallery';
import CooperationHistory from '../components/Detail/CooperationHistory';
import PredictionReasons from '../components/Detail/PredictionReasons';
import './DetailPage.css';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [influencer, setInfluencer] = useState(null);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const response = await influencerAPI.getDetail(id);
      if (response.success) {
        setInfluencer(response.data);
      } else {
        message.error(response.message || '加载失败');
        navigate('/search');
      }
    } catch (error) {
      message.error('加载失败，请稍后重试');
      console.error('加载详情错误:', error);
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!influencer) {
    return null;
  }

  const tabItems = [
    {
      key: '1',
      label: '数据分析',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="四维评分雷达图" className="card-shadow">
              <ScoreRadarChart scores={influencer.scores} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="粉丝画像分布" className="card-shadow">
              <FansProfileChart profile={influencer.fans_profile} />
            </Card>
          </Col>
          <Col xs={24}>
            <Card title="数据趋势" className="card-shadow">
              <TrendChart
                followersTrend={influencer.followers_trend}
                viewsTrend={influencer.views_trend}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: '内容作品',
      children: <WorksGallery works={influencer.recent_works} />,
    },
    {
      key: '3',
      label: '商单历史',
      children: <CooperationHistory history={influencer.cooperation_history} />,
    },
  ];

  return (
    <div className="detail-page">
      {/* 返回按钮 */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
      >
        返回列表
      </Button>

      {/* 基础信息卡片 */}
      <Card className="header-card card-shadow">
        <Row gutter={24}>
          {/* 左侧：头像和基本信息 */}
          <Col xs={24} md={8}>
            <div className="profile-section">
              <Avatar size={120} src={influencer.avatar} icon={<UserOutlined />} />
              <div className="profile-info">
                <Space align="center" size={12}>
                  <h1 className="profile-name">{influencer.name}</h1>
                  {influencer.verified && (
                    <Tooltip title="官方认证">
                      <CheckCircleFilled style={{ color: '#1890ff', fontSize: 24 }} />
                    </Tooltip>
                  )}
                </Space>
                <div className="profile-tags">
                  <Tag color="blue" style={{ fontSize: 14 }}>{influencer.platform}</Tag>
                  <Tag style={{ fontSize: 14 }}>{influencer.category}</Tag>
                  <Tag style={{ fontSize: 14 }}>{influencer.gender}</Tag>
                  <Tag style={{ fontSize: 14 }}>{influencer.age_range}岁</Tag>
                  <Tag style={{ fontSize: 14 }}>{influencer.location}</Tag>
                </div>
                {influencer.mcn && (
                  <div style={{ marginTop: 12 }}>
                    <Tag color="purple" style={{ fontSize: 14 }}>MCN: {influencer.mcn}</Tag>
                  </div>
                )}
                {/* 联系方式 */}
                <div className="contact-info">
                  {influencer.contact.wechat && (
                    <Tooltip title="可通过微信联系">
                      <WechatOutlined style={{ fontSize: 20, color: '#07c160' }} />
                    </Tooltip>
                  )}
                  {influencer.contact.phone && (
                    <Tooltip title="可通过电话联系">
                      <PhoneOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    </Tooltip>
                  )}
                  {influencer.contact.email && (
                    <Tooltip title="可通过邮件联系">
                      <MailOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* 中间：核心数据 */}
          <Col xs={24} md={8}>
            <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
              <Descriptions.Item label="粉丝数">
                <span className="stat-value">{formatNumberShort(influencer.followers_count)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="平均播放量">
                <span className="stat-value">{formatNumberShort(influencer.avg_views)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="互动率">
                <span className="stat-value">{formatPercent(influencer.engagement_rate)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="完播率">
                <span className="stat-value">{formatPercent(influencer.completion_rate)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="30天发布频率">
                <span className="stat-value">{influencer.publish_frequency_30d}篇</span>
              </Descriptions.Item>
              <Descriptions.Item label="爆款内容数">
                <span className="stat-value">{influencer.explosive_content_count}个</span>
              </Descriptions.Item>
              <Descriptions.Item label="粉丝增长趋势">
                <Tag color={
                  influencer.fans_growth_trend === '上升' ? 'success' :
                  influencer.fans_growth_trend === '稳定' ? 'default' : 'warning'
                }>
                  {influencer.fans_growth_trend}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="报价范围">
                <span style={{ color: '#f5222d', fontWeight: 600 }}>
                  {formatPriceRange(influencer.price_min, influencer.price_max)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {/* 右侧：评分和爆款潜力 */}
          <Col xs={24} md={8}>
            <div className="scores-section">
              <div className="score-card">
                <div className="score-label">适配度评分</div>
                <div className="score-value" style={{ color: '#1890ff' }}>
                  {influencer.scores.adaptability_score}分
                </div>
              </div>
              <div className="score-card">
                <div className="score-label">影响力评分</div>
                <div className="score-value" style={{ color: '#52c41a' }}>
                  {influencer.scores.influence_score}分
                </div>
              </div>
              <div className="score-card">
                <div className="score-label">粉丝粘性评分</div>
                <div className="score-value" style={{ color: '#faad14' }}>
                  {influencer.scores.stickiness_score}分
                </div>
              </div>
              <div className="score-card highlight">
                <div className="score-label">爆款潜力评分</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Tag
                    color={getPotentialLevelColor(influencer.potential_level)}
                    style={{ fontSize: 18, padding: '4px 12px', marginRight: 0 }}
                  >
                    {getPotentialLevelText(influencer.potential_level)}
                  </Tag>
                  <span className="score-value" style={{ color: '#f5222d' }}>
                    {influencer.scores.potential_score}分
                  </span>
                </div>
              </div>

              {/* AI预测理由 */}
              <PredictionReasons reasons={influencer.prediction_reasons} />
            </div>
          </Col>
        </Row>

        {/* 风格标签 */}
        {influencer.style_tags && influencer.style_tags.length > 0 && (
          <div className="style-tags-section">
            <span className="tags-label">风格标签：</span>
            <Space wrap>
              {influencer.style_tags.map((tag, index) => (
                <Tag key={index} color="cyan">{tag}</Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* Tabs区域 */}
      <Card className="content-card card-shadow" style={{ marginTop: 24 }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default DetailPage;

