import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Progress, Timeline, Badge, Space, Alert, Statistic, Row, Col, Switch, Select, message, Tag } from 'antd';
import {
  RobotOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import './CrawlerPage.css';

const { Option } = Select;

const CrawlerPage = () => {
  const [status, setStatus] = useState({
    isRunning: false,
    currentPlatform: null,
    progress: 0,
    total: 4,
    collected: 0,
    logs: [],
  });
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef(null);
  const logsEndRef = useRef(null);
  
  // 定时任务相关
  const [scheduleConfig, setScheduleConfig] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedCron, setSelectedCron] = useState('0 0 * * *');

  useEffect(() => {
    loadScheduleConfig();
    loadPresets();
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // 自动滚动到最新日志
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status.logs]);

  const startCrawling = async () => {
    try {
      const response = await axios.post('/api/crawler/start');
      if (response.data.success) {
        setIsPolling(true);
        startPolling();
      }
    } catch (error) {
      console.error('启动爬虫失败:', error);
      alert('启动失败：' + (error.response?.data?.message || error.message));
    }
  };

  const stopCrawling = async () => {
    try {
      await axios.post('/api/crawler/stop');
      setIsPolling(false);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    } catch (error) {
      console.error('停止爬虫失败:', error);
    }
  };

  const resetCrawler = async () => {
    try {
      await axios.post('/api/crawler/reset');
      setStatus({
        isRunning: false,
        currentPlatform: null,
        progress: 0,
        total: 4,
        collected: 0,
        logs: [],
      });
    } catch (error) {
      console.error('重置失败:', error);
    }
  };

  const startPolling = () => {
    // 立即获取一次状态
    fetchStatus();

    // 每500ms轮询一次状态
    pollingRef.current = setInterval(async () => {
      await fetchStatus();
    }, 500);
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get('/api/crawler/status');
      if (response.data.success) {
        const newStatus = response.data.data;
        setStatus(newStatus);

        // 如果爬取完成，停止轮询
        if (!newStatus.isRunning && newStatus.progress === newStatus.total && isPolling) {
          setIsPolling(false);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
        }
      }
    } catch (error) {
      console.error('获取状态失败:', error);
    }
  };

  const loadScheduleConfig = async () => {
    try {
      const response = await axios.get('/api/scheduler/config');
      if (response.data.success) {
        setScheduleConfig(response.data.data);
      }
    } catch (error) {
      console.error('加载定时配置失败:', error);
    }
  };

  const loadPresets = async () => {
    try {
      const response = await axios.get('/api/scheduler/presets');
      if (response.data.success) {
        setPresets(response.data.data);
      }
    } catch (error) {
      console.error('加载预设失败:', error);
    }
  };

  const handleScheduleToggle = async (checked) => {
    try {
      if (checked) {
        const response = await axios.post('/api/scheduler/enable', {
          cronExpression: selectedCron
        });
        if (response.data.success) {
          setScheduleConfig(response.data.data);
          message.success('定时任务已启用');
        }
      } else {
        const response = await axios.post('/api/scheduler/disable');
        if (response.data.success) {
          setScheduleConfig(response.data.data);
          message.success('定时任务已禁用');
        }
      }
    } catch (error) {
      message.error('操作失败：' + (error.response?.data?.message || error.message));
    }
  };

  const handleCronChange = (value) => {
    setSelectedCron(value);
  };

  const handleTriggerNow = async () => {
    try {
      message.loading('正在手动触发爬虫任务...', 0);
      const response = await axios.post('/api/scheduler/trigger');
      message.destroy();
      
      if (response.data.success) {
        message.success('爬虫任务已完成');
        // 刷新状态
        fetchStatus();
      }
    } catch (error) {
      message.destroy();
      message.error('触发失败：' + (error.response?.data?.message || error.message));
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const formatNextRunTime = (isoString) => {
    if (!isoString) return '未设置';
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatLastRunTime = (isoString) => {
    if (!isoString) return '从未执行';
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const progressPercent = status.total > 0 ? (status.progress / status.total) * 100 : 0;

  return (
    <div className="crawler-page">
      <div className="page-title">
        <RobotOutlined style={{ marginRight: 8, fontSize: 28 }} />
        智能爬虫系统
      </div>

      <Alert
        message="演示说明"
        description='点击"启动爬虫"按钮，系统将模拟从抖音、小红书、快手、B站等平台爬取达人数据，并自动整理和分析。您也可以启用定时任务，让系统自动在指定时间执行爬虫。'
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 定时任务配置 */}
      {scheduleConfig && (
        <Card 
          title={
            <Space>
              <ClockCircleOutlined />
              定时爬虫配置
            </Space>
          }
          className="schedule-card card-shadow" 
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div className="schedule-control">
                <div className="control-label">启用定时任务</div>
                <Switch
                  checked={scheduleConfig.enabled}
                  onChange={handleScheduleToggle}
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                  size="default"
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="schedule-control">
                <div className="control-label">执行频率</div>
                <Select
                  style={{ width: '100%' }}
                  value={scheduleConfig.enabled ? scheduleConfig.cronExpression : selectedCron}
                  onChange={handleCronChange}
                  disabled={scheduleConfig.enabled}
                >
                  {presets.map((preset, index) => (
                    <Option key={index} value={preset.value}>
                      <div>
                        <div>{preset.label}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{preset.description}</div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="schedule-control">
                <div className="control-label">快速操作</div>
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={handleTriggerNow}
                  block
                >
                  立即执行一次
                </Button>
              </div>
            </Col>
          </Row>

          <div className="schedule-info">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div className="info-item">
                  <span className="info-label">下次执行时间：</span>
                  <Tag color={scheduleConfig.enabled ? 'blue' : 'default'} style={{ fontSize: 14 }}>
                    {formatNextRunTime(scheduleConfig.nextRun)}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="info-item">
                  <span className="info-label">上次执行时间：</span>
                  <Tag color="green" style={{ fontSize: 14 }}>
                    {formatLastRunTime(scheduleConfig.lastRun)}
                  </Tag>
                </div>
              </Col>
            </Row>
          </div>

          {scheduleConfig.enabled && (
            <Alert
              message="定时任务已启用"
              description={`系统将在 ${formatNextRunTime(scheduleConfig.nextRun)} 自动执行爬虫任务`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      )}

      {/* 控制面板 */}
      <Card className="control-card card-shadow" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic
              title="爬取进度"
              value={status.progress}
              suffix={`/ ${status.total}`}
              prefix={<RobotOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="已收集达人"
              value={status.collected}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="当前状态"
              value={status.isRunning ? '运行中' : '空闲'}
              valueStyle={{ color: status.isRunning ? '#52c41a' : '#8c8c8c' }}
            />
          </Col>
        </Row>

        <div style={{ marginTop: 24 }}>
          <Progress
            percent={progressPercent}
            status={status.isRunning ? 'active' : progressPercent === 100 ? 'success' : 'normal'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>

        {status.currentPlatform && (
          <div className="current-platform">
            <Badge status="processing" text={`正在爬取：${status.currentPlatform}`} />
          </div>
        )}

        <Space style={{ marginTop: 24 }}>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={startCrawling}
            disabled={status.isRunning}
            className="action-button"
          >
            启动爬虫
          </Button>
          <Button
            danger
            size="large"
            icon={<StopOutlined />}
            onClick={stopCrawling}
            disabled={!status.isRunning}
          >
            停止爬虫
          </Button>
          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={resetCrawler}
            disabled={status.isRunning}
          >
            重置
          </Button>
        </Space>
      </Card>

      {/* 爬取日志 */}
      <Card title="爬取日志" className="logs-card card-shadow">
        <div className="logs-container">
          {status.logs.length === 0 ? (
            <div className="logs-empty">点击"启动爬虫"开始数据采集...</div>
          ) : (
            <Timeline mode="left">
              {status.logs.map((log, index) => (
                <Timeline.Item
                  key={index}
                  dot={getLogIcon(log.type)}
                  color={
                    log.type === 'success' ? 'green' :
                    log.type === 'warning' ? 'orange' :
                    log.type === 'error' ? 'red' : 'blue'
                  }
                >
                  <div className="log-item">
                    <div className="log-title">{log.title}</div>
                    <div className="log-message">{log.message}</div>
                    <div className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
              <div ref={logsEndRef} />
            </Timeline>
          )}
        </div>
      </Card>

      {/* 爬取完成提示 */}
      {!status.isRunning && status.progress === status.total && status.collected > 0 && (
        <Card className="complete-card card-shadow" style={{ marginTop: 24 }}>
          <Alert
            message="🎉 爬取完成！数据已自动更新"
            description={
              <div>
                <p>✅ 成功爬取 <strong>{status.collected}</strong> 个达人数据</p>
                <p>✅ 数据已自动整理并加入筛选列表</p>
                <p>✅ 现在筛选系统中包含最新的达人信息</p>
                <p style={{ marginTop: 12, marginBottom: 0 }}>
                  您可以返回智能筛选页面，使用AI智能搜索或高级筛选功能查找合适的达人。
                </p>
              </div>
            }
            type="success"
            showIcon
            action={
              <Space direction="vertical">
                <Button type="primary" onClick={() => window.location.href = '/search'}>
                  前往AI搜索
                </Button>
                <Button onClick={resetCrawler}>
                  重置爬虫
                </Button>
              </Space>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default CrawlerPage;

