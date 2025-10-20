import React from 'react';
import { Card, Row, Col, Avatar, Tag, Progress, Space, Checkbox, Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  EyeOutlined,
  FireOutlined,
  HeartOutlined,
  TrophyOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import {
  formatNumberShort,
  formatPercent,
  getScoreColor,
  getPotentialLevelColor,
  formatPriceRange,
} from '../../utils/format';
import './InfluencerCard.css';

const InfluencerCard = ({ influencer, selected, onSelectChange }) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/detail/${influencer.id}`);
  };

  const getTagsToShow = () => {
    const tags = [];
    if (influencer.tags.includes('高爆款潜力')) {
      tags.push({ text: '高爆款潜力', className: 'tag-hot' });
    }
    if (influencer.tags.includes('近期爆款')) {
      tags.push({ text: '近期爆款', className: 'tag-rising' });
    }
    if (influencer.tags.includes('高性价比')) {
      tags.push({ text: '高性价比', className: 'tag-cost-effective' });
    }
    if (influencer.tags.includes('商单口碑优')) {
      tags.push({ text: '商单口碑优', className: 'tag-reputation' });
    }
    return tags;
  };

  const specialTags = getTagsToShow();

  return (
    <Card
      className={`influencer-card card-shadow ${selected ? 'selected' : ''}`}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={24}>
        {/* 左侧：选择框和头像信息 */}
        <Col xs={24} md={6}>
          <div className="influencer-header">
            <Checkbox
              checked={selected}
              onChange={(e) => onSelectChange(e.target.checked)}
              className="select-checkbox"
            />
            <Avatar size={80} src={influencer.avatar} icon={<UserOutlined />} />
            <div className="influencer-basic">
              <Space align="center">
                <h3 className="influencer-name">{influencer.name}</h3>
                {influencer.verified && (
                  <Tooltip title="官方认证">
                    <CheckCircleFilled style={{ color: '#1890ff', fontSize: 16 }} />
                  </Tooltip>
                )}
              </Space>
              <Space size={8} wrap>
                <Tag color="blue">{influencer.platform}</Tag>
                <Tag>{influencer.category}</Tag>
                <Tag>{influencer.gender}</Tag>
              </Space>
              {influencer.mcn && (
                <div className="mcn-tag">
                  <Tag color="purple">{influencer.mcn}</Tag>
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* 中间：核心数据 */}
        <Col xs={24} md={8}>
          <div className="influencer-stats">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="stat-item">
                  <UserOutlined className="stat-icon" style={{ color: '#1890ff' }} />
                  <div>
                    <div className="stat-label">粉丝数</div>
                    <div className="stat-value">{formatNumberShort(influencer.followers_count)}</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="stat-item">
                  <EyeOutlined className="stat-icon" style={{ color: '#52c41a' }} />
                  <div>
                    <div className="stat-label">平均播放</div>
                    <div className="stat-value">{formatNumberShort(influencer.avg_views)}</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="stat-item">
                  <HeartOutlined className="stat-icon" style={{ color: '#ff4d4f' }} />
                  <div>
                    <div className="stat-label">互动率</div>
                    <div className="stat-value">{formatPercent(influencer.engagement_rate)}</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="stat-item">
                  <FireOutlined className="stat-icon" style={{ color: '#fa8c16' }} />
                  <div>
                    <div className="stat-label">爆款数</div>
                    <div className="stat-value">{influencer.explosive_content_count}</div>
                  </div>
                </div>
              </Col>
            </Row>
            
            {/* 价格范围 */}
            <div className="price-range">
              <span className="price-label">报价：</span>
              <span className="price-value">
                {formatPriceRange(influencer.price_min, influencer.price_max)}
              </span>
            </div>
          </div>
        </Col>

        {/* 右侧：四维评分 */}
        <Col xs={24} md={10}>
          <div className="influencer-scores">
            <div className="score-item">
              <div className="score-header">
                <span>适配度</span>
                <span style={{ color: getScoreColor(influencer.scores.adaptability_score), fontWeight: 600 }}>
                  {influencer.scores.adaptability_score}分
                </span>
              </div>
              <Progress
                percent={influencer.scores.adaptability_score}
                strokeColor={getScoreColor(influencer.scores.adaptability_score)}
                showInfo={false}
                size="small"
              />
            </div>

            <div className="score-item">
              <div className="score-header">
                <span>影响力</span>
                <span style={{ color: getScoreColor(influencer.scores.influence_score), fontWeight: 600 }}>
                  {influencer.scores.influence_score}分
                </span>
              </div>
              <Progress
                percent={influencer.scores.influence_score}
                strokeColor={getScoreColor(influencer.scores.influence_score)}
                showInfo={false}
                size="small"
              />
            </div>

            <div className="score-item">
              <div className="score-header">
                <span>粉丝粘性</span>
                <span style={{ color: getScoreColor(influencer.scores.stickiness_score), fontWeight: 600 }}>
                  {influencer.scores.stickiness_score}分
                </span>
              </div>
              <Progress
                percent={influencer.scores.stickiness_score}
                strokeColor={getScoreColor(influencer.scores.stickiness_score)}
                showInfo={false}
                size="small"
              />
            </div>

            <div className="score-item">
              <div className="score-header">
                <span>爆款潜力</span>
                <Space>
                  <Tag
                    color={getPotentialLevelColor(influencer.potential_level)}
                    style={{ fontWeight: 600, fontSize: 14 }}
                  >
                    {influencer.potential_level}级
                  </Tag>
                  <span style={{ color: getScoreColor(influencer.scores.potential_score), fontWeight: 600 }}>
                    {influencer.scores.potential_score}分
                  </span>
                </Space>
              </div>
              <Progress
                percent={influencer.scores.potential_score}
                strokeColor={getScoreColor(influencer.scores.potential_score)}
                showInfo={false}
                size="small"
              />
            </div>

            {/* 特殊标签 */}
            {specialTags.length > 0 && (
              <div className="special-tags">
                {specialTags.map((tag, index) => (
                  <Tag key={index} className={tag.className}>
                    {tag.text}
                  </Tag>
                ))}
              </div>
            )}

            {/* 查看详情按钮 */}
            <Button
              type="primary"
              block
              onClick={handleViewDetail}
              style={{ marginTop: 12 }}
            >
              查看详情
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default InfluencerCard;

