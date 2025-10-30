import React, { useState } from 'react';
import { Layout, Space, Typography, Button, Modal, message, Input } from 'antd';
import { RocketOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { dataAPI, cookieAPI } from '../../services/api';

const { Header } = Layout;
const { Title } = Typography;
const { confirm } = Modal;

const AppHeader = () => {
  const [loading, setLoading] = useState(false);
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const [cookieValue, setCookieValue] = useState('');

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

  const openCookieModal = async () => {
    setCookieModalOpen(true);
    try {
      const resp = await cookieAPI.get();
      if (resp.success) {
        setCookieValue(resp.data || '');
      }
    } catch (e) {
      // 忽略错误，用户可直接填写
    }
  };

  const handleSaveCookie = async () => {
    try {
      if (!cookieValue || cookieValue.trim().length < 10) {
        message.warning('请粘贴完整的 Cookie 字符串');
        return;
      }
      const resp = await cookieAPI.set(cookieValue.trim());
      if (resp.success) {
        message.success('Cookie 已更新');
        setCookieModalOpen(false);
      } else {
        message.error(resp.message || '更新失败');
      }
    } catch (e) {
      message.error('网络错误，更新失败');
    }
  };

  return (
    <>
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
          onClick={openCookieModal}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#fff'
          }}
        >
          填写Cookie
        </Button>
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
    <Modal
      title="填写抖音 Cookie"
      open={cookieModalOpen}
      onOk={handleSaveCookie}
      onCancel={() => setCookieModalOpen(false)}
      okText="保存"
      cancelText="取消"
    >
      <p style={{ color: '#999' }}>请在浏览器登录抖音后，复制请求中的 Cookie 字段完整内容粘贴到下方：</p>
      <Input.TextArea
        value={cookieValue}
        onChange={(e) => setCookieValue(e.target.value)}
        autoSize={{ minRows: 4, maxRows: 12 }}
        placeholder="例如：msToken=...; s_v_web_id=...; sessionid=...; ..."
      />
    </Modal>
    </>
  );
};

export default AppHeader;

