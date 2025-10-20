import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Slider, Button, Space, Divider, InputNumber, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { influencerAPI } from '../../services/api';
import './FilterPanel.css';

const { Option } = Select;

const FilterPanel = ({ onFilterChange, loading }) => {
  const [form] = Form.useForm();
  const [options, setOptions] = useState(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await influencerAPI.getFilterOptions();
      if (response.success) {
        setOptions(response.data);
      }
    } catch (error) {
      console.error('加载选项失败:', error);
    }
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const filters = {};

    // 处理表单值
    if (values.platform) filters.platform = values.platform;
    if (values.category) filters.category = values.category;
    if (values.styleTag) filters.styleTag = values.styleTag;
    if (values.gender) filters.gender = values.gender;
    if (values.potentialLevel) filters.potentialLevel = values.potentialLevel;
    if (values.fansGrowthTrend) filters.fansGrowthTrend = values.fansGrowthTrend;

    // 粉丝量范围
    if (values.followersRange) {
      const [min, max] = values.followersRange;
      filters.followersMin = min;
      filters.followersMax = max;
    }

    // 互动率
    if (values.engagementRate !== undefined) {
      filters.engagementRateMin = values.engagementRate / 100;
    }

    // 完播率
    if (values.completionRate !== undefined) {
      filters.completionRateMin = values.completionRate / 100;
    }

    // 评分筛选
    if (values.adaptabilityScore) filters.adaptabilityScoreMin = values.adaptabilityScore;
    if (values.influenceScore) filters.influenceScoreMin = values.influenceScore;
    if (values.stickinessScore) filters.stickinessScoreMin = values.stickinessScore;
    if (values.potentialScore) filters.potentialScoreMin = values.potentialScore;

    onFilterChange(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onFilterChange({});
  };

  if (!options) {
    return <Card loading />;
  }

  return (
    <Card
      title="筛选条件"
      className="filter-panel card-shadow"
      extra={
        <Button
          type="link"
          icon={<ReloadOutlined />}
          onClick={handleReset}
          size="small"
        >
          重置
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSearch}
      >
        {/* 平台筛选 */}
        <Form.Item label="平台" name="platform">
          <Select
            mode="multiple"
            placeholder="选择平台"
            allowClear
          >
            {options.platforms.map(platform => (
              <Option key={platform} value={platform}>{platform}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* 类目筛选 */}
        <Form.Item label="类目" name="category">
          <Select
            mode="multiple"
            placeholder="选择类目"
            allowClear
          >
            {options.categories.map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </Form.Item>

        <Divider>适配度筛选</Divider>

        {/* 风格标签 */}
        <Form.Item label="风格标签" name="styleTag">
          <Select
            mode="multiple"
            placeholder="选择风格"
            allowClear
          >
            {options.styleTags.map(tag => (
              <Option key={tag} value={tag}>{tag}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* 性别 */}
        <Form.Item label="性别" name="gender">
          <Select
            mode="multiple"
            placeholder="选择性别"
            allowClear
          >
            {options.genders.map(gender => (
              <Option key={gender} value={gender}>{gender}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* 适配度评分 */}
        <Form.Item label="适配度评分" name="adaptabilityScore">
          <Slider min={0} max={100} marks={{ 0: '0', 50: '50', 100: '100' }} />
        </Form.Item>

        <Divider>影响力筛选</Divider>

        {/* 粉丝量范围 */}
        <Form.Item label="粉丝量范围" name="followersRange">
          <Slider
            range
            min={0}
            max={5000000}
            step={10000}
            marks={{
              0: '0',
              1000000: '100万',
              5000000: '500万',
            }}
          />
        </Form.Item>

        {/* 影响力评分 */}
        <Form.Item label="影响力评分" name="influenceScore">
          <Slider min={0} max={100} marks={{ 0: '0', 50: '50', 100: '100' }} />
        </Form.Item>

        <Divider>粉丝粘性筛选</Divider>

        {/* 互动率 */}
        <Form.Item label={`互动率 ≥ (当前: ${form.getFieldValue('engagementRate') || 0}%)`} name="engagementRate">
          <Slider min={0} max={15} step={0.5} marks={{ 0: '0%', 5: '5%', 10: '10%', 15: '15%' }} />
        </Form.Item>

        {/* 完播率 */}
        <Form.Item label={`完播率 ≥ (当前: ${form.getFieldValue('completionRate') || 0}%)`} name="completionRate">
          <Slider min={0} max={100} step={5} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
        </Form.Item>

        {/* 粉丝增长趋势 */}
        <Form.Item label="粉丝增长趋势" name="fansGrowthTrend">
          <Select
            mode="multiple"
            placeholder="选择趋势"
            allowClear
          >
            {options.growthTrends.map(trend => (
              <Option key={trend} value={trend}>{trend}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* 粘性评分 */}
        <Form.Item label="粘性评分" name="stickinessScore">
          <Slider min={0} max={100} marks={{ 0: '0', 50: '50', 100: '100' }} />
        </Form.Item>

        <Divider>爆款潜力筛选</Divider>

        {/* 潜力等级 */}
        <Form.Item label="潜力等级" name="potentialLevel">
          <Select
            mode="multiple"
            placeholder="选择等级"
            allowClear
          >
            {options.potentialLevels.map(level => (
              <Option key={level} value={level}>{level}级</Option>
            ))}
          </Select>
        </Form.Item>

        {/* 潜力评分 */}
        <Form.Item label="爆款潜力评分" name="potentialScore">
          <Slider min={0} max={100} marks={{ 0: '0', 50: '50', 100: '100' }} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            开始筛选
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FilterPanel;

