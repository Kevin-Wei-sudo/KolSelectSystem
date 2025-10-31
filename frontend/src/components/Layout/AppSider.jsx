import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchOutlined, BarChartOutlined, RobotOutlined, ExperimentOutlined, BookOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const AppSider = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/crawler',
      icon: <RobotOutlined />,
      label: '智能爬虫',
    },
    {
      key: '/search',
      icon: <SearchOutlined />,
      label: '智能筛选',
    },
    {
      key: '/compare',
      icon: <BarChartOutlined />,
      label: '达人对比',
    },
    {
      key: '/ai-model',
      icon: <ExperimentOutlined />,
      label: 'AI模型',
    },
    {
      key: '/tutorial',
      icon: <BookOutlined />,
      label: '使用教程',
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 获取当前路径的主路径（不包含参数）
  const currentPath = location.pathname.split('/')[1];
  const selectedKey = `/${currentPath}`;

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ height: '100%', borderRight: 0, paddingTop: 16 }}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default AppSider;

