import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Button } from 'antd';
import { UserOutlined, FireOutlined, RiseOutlined, DatabaseOutlined, ReloadOutlined } from '@ant-design/icons';
import { formatNumberShort } from '../../utils/format';
import axios from 'axios';

const StatsOverview = ({ stats, onReload }) => {
  const [dataStats, setDataStats] = useState(null);

  useEffect(() => {
    loadDataStats();
  }, [stats]);

  const loadDataStats = async () => {
    try {
      // const response = await axios.get('/api/data/stats');
      // if (response.data.success) {
      //   setDataStats(response.data.data);
      // }
    } catch (error) {
      console.error('加载数据统计失败:', error);
    }
  };

  const handleReload = async () => {
    try {
      const response = await axios.post('/api/data/reload');
      if (response.data.success) {
        loadDataStats();
        if (onReload) onReload();
      }
    } catch (error) {
      console.error('重新加载失败:', error);
    }
  };
  const statItems = [
    {
      title: '总达人数',
      value: stats.total,
      icon: <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: '高潜力达人',
      value: stats.highPotentialCount,
      icon: <FireOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
      color: '#f5222d',
    },
    {
      title: '平均粉丝数',
      value: formatNumberShort(stats.avgFollowers),
      icon: <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: '平台覆盖',
      value: Object.keys(stats.platformStats).length,
      suffix: '个',
      icon: <RiseOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      color: '#fa8c16',
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statItems.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} className="card-shadow">
              <Statistic
                title={item.title}
                value={item.value}
                suffix={item.suffix}
                prefix={item.icon}
                valueStyle={{ color: item.color, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      {dataStats && dataStats.lastUpdate && (
        <Card 
          size="small" 
          style={{ marginBottom: 24, background: '#e6f7ff', borderColor: '#91d5ff' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              📊 数据库包含 <strong style={{ color: '#1890ff' }}>{dataStats.total}</strong> 个达人 
              | 最后更新：{new Date(dataStats.lastUpdate).toLocaleString('zh-CN')}
            </span>
            <Button 
              size="small" 
              icon={<ReloadOutlined />}
              onClick={handleReload}
            >
              刷新数据
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatsOverview;

