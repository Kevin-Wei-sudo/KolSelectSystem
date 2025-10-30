import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Space, message, Tabs } from 'antd';
import { ExportOutlined, SwapOutlined, ThunderboltOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FilterPanel from '../components/Search/FilterPanel';
import InfluencerList from '../components/Search/InfluencerList';
import StatsOverview from '../components/Search/StatsOverview';
import NaturalLanguageSearch from '../components/Search/NaturalLanguageSearch';
import { influencerAPI } from '../services/api';
import { exportToExcel } from '../utils/export';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [influencers, setInfluencers] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    sort_by: 'influence',
    sort_order: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchMode, setSearchMode] = useState('natural'); // 'natural' or 'advanced'

  // 加载统计信息
  useEffect(() => {
    loadStats();
  }, []);

  // 初始加载数据
  useEffect(() => {
    handleSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    try {
      const response = await influencerAPI.getOverviewStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  const handleSearch = async (newFilters) => {
    setLoading(true);
    try {
      const response = await influencerAPI.search(newFilters);
      if (response.success) {
        setInfluencers(response.data);
        setTotal(response.total);
        setFilters(newFilters);
        // 清空选择
        setSelectedIds([]);
      } else {
        message.error(response.message || '搜索失败');
      }
    } catch (error) {
      message.error('搜索失败，请稍后重试');
      console.error('搜索错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    handleSearch({ ...filters, ...newFilters, page: 1 });
  };

  const handleSortChange = (sortBy, sortOrder) => {
    handleSearch({ ...filters, sort_by: sortBy, sort_order: sortOrder });
  };

  const handlePageChange = (page, pageSize) => {
    handleSearch({ ...filters, page, page_size: pageSize });
  };

  const handleSelectChange = (ids) => {
    setSelectedIds(ids);
  };

  const handleExport = async () => {
    if (influencers.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }
    try {
      await exportToExcel(influencers, '达人筛选结果');
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('导出错误:', error);
    }
  };

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      message.warning('请至少选择2个达人进行对比');
      return;
    }
    if (selectedIds.length > 5) {
      message.warning('最多只能对比5个达人');
      return;
    }
    navigate('/compare', { state: { ids: selectedIds } });
  };

  const handleNaturalLanguageSearch = (result) => {
    setInfluencers(result.influencers);
    setTotal(result.total);
    setSelectedIds([]);
  };

  return (
    <div className="search-page">
      <div className="page-title">智能筛选</div>

      {/* 统计概览 */}
      {stats && <StatsOverview stats={stats} onReload={() => {
        loadStats();
        handleSearch(filters);
      }} />}

      {/* 搜索模式切换 */}
      <Card className="search-mode-card card-shadow" style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={searchMode}
          onChange={setSearchMode}
          items={[
            {
              key: 'natural',
              label: (
                <span>
                  <ThunderboltOutlined />
                  AI智能搜索
                </span>
              ),
            },
            {
              key: 'advanced',
              label: (
                <span>
                  <FilterOutlined />
                  高级筛选
                </span>
              ),
            },
          ]}
        />
      </Card>

      {/* AI智能搜索 */}
      {searchMode === 'natural' && (
        <NaturalLanguageSearch onSearch={handleNaturalLanguageSearch} />
      )}

      <Row gutter={24}>
        {/* 筛选面板 - 仅在高级筛选模式显示 */}
        {searchMode === 'advanced' && (
          <Col xs={24} lg={6}>
            <FilterPanel onFilterChange={handleFilterChange} loading={loading} />
          </Col>
        )}

        {/* 结果列表 */}
        <Col xs={24} lg={searchMode === 'advanced' ? 18 : 24}>
          <Card
            className="result-card"
            title={
              <div className="result-header">
                <span>找到 <strong>{total}</strong> 个达人</span>
                <Space>
                  <Button
                    icon={<SwapOutlined />}
                    onClick={handleCompare}
                    disabled={selectedIds.length < 2 || selectedIds.length > 5}
                  >
                    对比 ({selectedIds.length})
                  </Button>
                  <Button
                    icon={<ExportOutlined />}
                    onClick={handleExport}
                    disabled={influencers.length === 0}
                  >
                    导出Excel
                  </Button>
                </Space>
              </div>
            }
          >
            <InfluencerList
              influencers={influencers}
              loading={loading}
              total={total}
              current={filters.page}
              pageSize={filters.pageSize}
              selectedIds={selectedIds}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              onSelectChange={handleSelectChange}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;

