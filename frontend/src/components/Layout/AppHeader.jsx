import React, { useState } from 'react';
import { Layout, Space, Typography, Button, Modal, message } from 'antd';
import { RocketOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { dataAPI } from '../../services/api';

const { Header } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

const AppHeader = () => {
  const [loading, setLoading] = useState(false);

  const handleTestDatabase = async () => {
    try {
      const response = await dataAPI.testDatabase();
      if (response.success) {
        message.info(`数据库连接正常 - 达人: ${response.data.influencerCount}, 定时任务: ${response.data.schedulerCount}`);
      } else {
        message.error(response.message || '数据库测试失败');
      }
    } catch (error) {
      console.error('数据库测试失败:', error);
      message.error('数据库连接失败');
    }
  };

  const handleResetDemo = () => {
    confirm({
      title: '确认重置Demo数据',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将清空所有数据表并重新加载初始数据，确定要继续吗？',
      okText: '确认重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await dataAPI.resetDemo();
          console.log('重置响应:', response); // 添加调试日志
          message.success(`重置成功！`);
        } catch (error) {
          console.error('重置Demo数据失败:', error);
          message.error('重置失败，请稍后重试');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Header style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
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
      
      <Space>
        <Button
          type="default"
          onClick={handleTestDatabase}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff'
          }}
        >
          测试DB
        </Button>
        <Button
          type="primary"
          danger
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={handleResetDemo}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            color: '#fff'
          }}
        >
          重置Demo
        </Button>
      </Space>
    </Header>
  );
};

export default AppHeader;

