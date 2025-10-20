import React from 'react';
import { Layout, Space, Typography } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  return (
    <Header style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Space align="center">
        <RocketOutlined style={{ fontSize: 28, color: '#fff' }} />
        <Title level={3} style={{ 
          color: '#fff', 
          margin: 0,
          fontWeight: 600
        }}>
          达人筛号系统
        </Title>
      </Space>
    </Header>
  );
};

export default AppHeader;

