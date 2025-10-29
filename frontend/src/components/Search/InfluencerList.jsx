import React from 'react';
import { List, Checkbox, Select, Space, Empty, Spin } from 'antd';
import { SortAscendingOutlined } from '@ant-design/icons';
import InfluencerCard from './InfluencerCard';
import './InfluencerList.css';

const { Option } = Select;

const InfluencerList = ({
  influencers,
  loading,
  total,
  current,
  pageSize,
  selectedIds,
  onPageChange,
  onSortChange,
  onSelectChange,
}) => {
  // 兼容不同数据源的ID字段
  const getInfluencerId = (inf) => inf?.id ?? inf?.['inf_新编号'] ?? inf?.infId ?? inf?.influencerId ?? null;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = influencers.map(inf => getInfluencerId(inf)).filter(Boolean);
      onSelectChange(allIds);
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('_');
    onSortChange(sortBy, sortOrder);
  };

  const isAllSelected = influencers.length > 0 && selectedIds.length === influencers.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < influencers.length;

  if (loading && influencers.length === 0) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!loading && influencers.length === 0) {
    return (
      <Empty
        description="未找到符合条件的达人，请调整筛选条件"
        style={{ padding: '60px 0' }}
      />
    );
  }

  return (
    <div className="influencer-list">
      {/* 工具栏 */}
      <div className="list-toolbar">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleSelectAll}
        >
          全选
        </Checkbox>
        <Space>
          <SortAscendingOutlined />
          <span>排序：</span>
          <Select
            defaultValue="influence_desc"
            style={{ width: 180 }}
            onChange={handleSortChange}
          >
            <Option value="influence_desc">影响力 从高到低</Option>
            <Option value="influence_asc">影响力 从低到高</Option>
            <Option value="potential_desc">爆款潜力 从高到低</Option>
            <Option value="potential_asc">爆款潜力 从低到高</Option>
            <Option value="stickiness_desc">粉丝粘性 从高到低</Option>
            <Option value="stickiness_asc">粉丝粘性 从低到高</Option>
            <Option value="adaptability_desc">适配度 从高到低</Option>
            <Option value="adaptability_asc">适配度 从低到高</Option>
            <Option value="followers_desc">粉丝数 从高到低</Option>
            <Option value="followers_asc">粉丝数 从低到高</Option>
            <Option value="engagementRate_desc">互动率 从高到低</Option>
            <Option value="engagementRate_asc">互动率 从低到高</Option>
          </Select>
        </Space>
      </div>

      {/* 列表 */}
      <List
        loading={loading}
        dataSource={influencers}
        renderItem={(influencer) => (
          <List.Item key={getInfluencerId(influencer) || influencer.name} style={{ padding: 0, border: 'none' }}>
            <InfluencerCard
              influencer={influencer}
              selected={selectedIds.includes(getInfluencerId(influencer))}
              onSelectChange={(checked) => handleSelectOne(getInfluencerId(influencer), checked)}
            />
          </List.Item>
        )}
        pagination={{
          current,
          pageSize,
          total,
          onChange: onPageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个达人`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />
    </div>
  );
};

export default InfluencerList;

