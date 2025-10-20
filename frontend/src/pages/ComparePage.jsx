import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Row,
  Col,
  Table,
  Avatar,
  Tag,
  Space,
  Empty,
  Spin,
  message,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  ExportOutlined,
  UserOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { influencerAPI } from '../services/api';
import {
  formatNumberShort,
  formatPercent,
  formatPriceRange,
  getPotentialLevelColor,
} from '../utils/format';
import { exportComparisonToExcel } from '../utils/export';
import ComparisonRadarChart from '../components/Compare/ComparisonRadarChart';
import AnalysisCards from '../components/Compare/AnalysisCards';
import './ComparePage.css';

const ComparePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const ids = location.state?.ids;
    if (!ids || ids.length < 2) {
      message.warning('请先选择要对比的达人');
      navigate('/search');
      return;
    }
    loadComparison(ids);
  }, [location.state]);

  const loadComparison = async (ids) => {
    setLoading(true);
    try {
      const response = await influencerAPI.compare(ids);
      if (response.success) {
        setComparison(response.data);
      } else {
        message.error(response.message || '加载失败');
        navigate('/search');
      }
    } catch (error) {
      message.error('加载失败，请稍后重试');
      console.error('加载对比数据错误:', error);
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportComparisonToExcel(comparison, '达人对比报告');
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('导出错误:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!comparison || !comparison.influencers || comparison.influencers.length === 0) {
    return (
      <div className="compare-page">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/search')}
          style={{ marginBottom: 24 }}
        >
          返回列表
        </Button>
        <Empty description="没有要对比的达人" />
      </div>
    );
  }

  const { influencers, analysis } = comparison;

  // 准备基础信息对比数据
  const basicComparisonData = [
    {
      key: '1',
      metric: '平台',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = <Tag color="blue">{inf.platform}</Tag>;
        return acc;
      }, {}),
    },
    {
      key: '2',
      metric: '类目',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = inf.category;
        return acc;
      }, {}),
    },
    {
      key: '3',
      metric: '粉丝数',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = <strong>{formatNumberShort(inf.followers_count)}</strong>;
        return acc;
      }, {}),
    },
    {
      key: '4',
      metric: '平均播放量',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = <strong>{formatNumberShort(inf.avg_views)}</strong>;
        return acc;
      }, {}),
    },
    {
      key: '5',
      metric: '互动率',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = <strong style={{ color: '#52c41a' }}>{formatPercent(inf.engagement_rate)}</strong>;
        return acc;
      }, {}),
    },
    {
      key: '6',
      metric: '完播率',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = <strong style={{ color: '#1890ff' }}>{formatPercent(inf.completion_rate)}</strong>;
        return acc;
      }, {}),
    },
    {
      key: '7',
      metric: '30天发布频率',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = `${inf.publish_frequency_30d}篇`;
        return acc;
      }, {}),
    },
    {
      key: '8',
      metric: '爆款内容数',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = <strong style={{ color: '#fa8c16' }}>{inf.explosive_content_count}个</strong>;
        return acc;
      }, {}),
    },
    {
      key: '9',
      metric: '粉丝增长趋势',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = (
          <Tag color={
            inf.fans_growth_trend === '上升' ? 'success' :
            inf.fans_growth_trend === '稳定' ? 'default' : 'warning'
          }>
            {inf.fans_growth_trend}
          </Tag>
        );
        return acc;
      }, {}),
    },
    {
      key: '10',
      metric: '报价范围',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = (
          <span style={{ color: '#f5222d', fontWeight: 600 }}>
            {formatPriceRange(inf.price_min, inf.price_max)}
          </span>
        );
        return acc;
      }, {}),
    },
    {
      key: '11',
      metric: '商单口碑',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = (
          <strong style={{ color: inf.cooperation_reputation >= 0.85 ? '#52c41a' : '#faad14' }}>
            {(inf.cooperation_reputation * 100).toFixed(0)}分
          </strong>
        );
        return acc;
      }, {}),
    },
  ];

  // 准备评分对比数据
  const scoreComparisonData = [
    {
      key: '1',
      metric: '适配度评分',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = (
          <strong style={{ color: '#1890ff', fontSize: 18 }}>
            {inf.scores.adaptability_score}分
          </strong>
        );
        return acc;
      }, {}),
    },
    {
      key: '2',
      metric: '影响力评分',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = (
          <strong style={{ color: '#52c41a', fontSize: 18 }}>
            {inf.scores.influence_score}分
          </strong>
        );
        return acc;
      }, {}),
    },
    {
      key: '3',
      metric: '粉丝粘性评分',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = (
          <strong style={{ color: '#faad14', fontSize: 18 }}>
            {inf.scores.stickiness_score}分
          </strong>
        );
        return acc;
      }, {}),
    },
    {
      key: '4',
      metric: '爆款潜力评分',
      ...influencers.reduce((acc, inf, index) => {
        acc[`inf${index}`] = (
          <Space>
            <Tag
              color={getPotentialLevelColor(inf.potential_level)}
              style={{ fontSize: 16, padding: '4px 12px' }}
            >
              {inf.potential_level}级
            </Tag>
            <strong style={{ color: '#f5222d', fontSize: 18 }}>
              {inf.scores.potential_score}分
            </strong>
          </Space>
        );
        return acc;
      }, {}),
    },
  ];

  // 表格列配置
  const columns = [
    {
      title: '对比指标',
      dataIndex: 'metric',
      key: 'metric',
      fixed: 'left',
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    ...influencers.map((inf, index) => ({
      title: (
        <div className="influencer-header-cell">
          <Avatar size={48} src={inf.avatar} icon={<UserOutlined />} />
          <div className="influencer-info">
            <Space align="center">
              <span className="influencer-name">{inf.name}</span>
              {inf.verified && <CheckCircleFilled style={{ color: '#1890ff', fontSize: 16 }} />}
            </Space>
            <div className="influencer-tags">
              <Tag color="blue">{inf.platform}</Tag>
              <Tag>{inf.category}</Tag>
            </div>
          </div>
        </div>
      ),
      dataIndex: `inf${index}`,
      key: `inf${index}`,
      width: 200,
      align: 'center',
    })),
  ];

  return (
    <div className="compare-page">
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/search')}
        >
          返回列表
        </Button>
        <Button
          type="primary"
          icon={<ExportOutlined />}
          onClick={handleExport}
        >
          导出Excel
        </Button>
      </div>

      <div className="page-title">达人对比分析</div>

      <Alert
        message="提示"
        description={`正在对比 ${influencers.length} 个达人，可以从多个维度查看对比数据`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 四维评分雷达图对比 */}
      <Card title="四维评分对比" className="card-shadow" style={{ marginBottom: 24 }}>
        <ComparisonRadarChart influencers={influencers} />
      </Card>

      {/* AI分析结果 */}
      <Card title="AI优劣势分析" className="card-shadow" style={{ marginBottom: 24 }}>
        <AnalysisCards analysis={analysis} />
      </Card>

      {/* 评分对比表格 */}
      <Card title="评分对比" className="card-shadow" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={scoreComparisonData}
          pagination={false}
          bordered
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 基础数据对比表格 */}
      <Card title="基础数据对比" className="card-shadow">
        <Table
          columns={columns}
          dataSource={basicComparisonData}
          pagination={false}
          bordered
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default ComparePage;

