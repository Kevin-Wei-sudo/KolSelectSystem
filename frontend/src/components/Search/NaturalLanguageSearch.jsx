import React, { useState } from 'react';
import { Input, Button, Space, Tag, Card, Alert, AutoComplete, message } from 'antd';
import { SearchOutlined, BulbOutlined, ThunderboltOutlined } from '@ant-design/icons';
import './NaturalLanguageSearch.css';
import { influencerAPI } from '../../services/api';

const { TextArea } = Input;

const NaturalLanguageSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadSuggestions = async () => {
    try {
      const resp = await influencerAPI.getPresetPhrases();
      const list = Array.isArray(resp?.data)
        ? resp.data
        : Array.isArray(resp)
        ? resp
        : [];
      setSuggestions(list.map(text => ({ value: text })));
      setSuggestionsLoaded(true);
    } catch (error) {
      console.warn('加载预设语句失败:', error);
      message.error('预设语句加载失败，请稍后重试');
      setSuggestions([]);
      setSuggestionsLoaded(true);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      message.warning('请输入或选择预设语句');
      return;
    }

    setLoading(true);
    try {
      const dto = await influencerAPI.searchByPreset({ phrase: query, page: 1, pageSize: 20 });
      const list = Array.isArray(dto?.data)
        ? dto.data
        : Array.isArray(dto?.list)
        ? dto.list
        : Array.isArray(dto)
        ? dto
        : [];
      const total = dto?.total ?? list.length;
      const result = {
        explanation: `按预设语句检索：${query}`,
        recommendations: [],
        total,
        influencers: list,
      };
      setSearchResult(result);
      onSearch(result);
    } catch (error) {
      console.error('搜索失败:', error);
      message.error('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setDropdownOpen(false);
  };

  const handleFocus = () => {
    setDropdownOpen(true);
    if (!suggestionsLoaded) {
      loadSuggestions();
    }
  };

  const handleBlur = () => {
    setTimeout(() => setDropdownOpen(false), 120);
  };

  const filteredSuggestions = query
    ? suggestions.filter((s) => s.value.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  return (
    <div className="natural-language-search">
      {/* 搜索框区域 */}
      <Card className="search-card card-shadow">
        <div className="search-header">
          <h2>
            <ThunderboltOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            AI智能搜索
          </h2>
          <p className="search-subtitle">用自然语言描述您的需求，AI帮您找到最合适的达人</p>
        </div>

        <div className="search-input-wrapper">
          <AutoComplete
            style={{ width: '100%' }}
            options={filteredSuggestions}
            value={query}
            open={dropdownOpen}
            onChange={setQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelect={(value) => handleSuggestionClick(value)}
            filterOption={(inputValue, option) => option.value.toLowerCase().includes(inputValue.toLowerCase())}
          >
            <TextArea
              placeholder="例如：帮我找10个小红书美妆类的女性达人，粉丝在10-50万，互动率要高，爆款潜力大..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-textarea"
            />
          </AutoComplete>

          <div className="search-actions">
            <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch} loading={loading} className="search-button">
              智能搜索
            </Button>
          </div>
        </div>

        {/* 搜索建议（仅显示后端返回的内容） */}
        {suggestions.length > 0 && (
          <div className="search-suggestions">
            <div className="suggestions-label">
              <BulbOutlined style={{ color: '#faad14' }} />
              <span>试试这些：</span>
            </div>
            <Space wrap>
              {suggestions.slice(0, 4).map((item, index) => (
                <Tag
                  key={index}
                  className="suggestion-tag"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(item.value);
                  }}
                >
                  {item.value}
                </Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* 搜索结果解释 */}
      {searchResult && (
        <Card className="result-explanation-card card-shadow" style={{ marginTop: 16 }}>
          <div className="explanation-header">
            <h3>AI理解您的需求为：</h3>
          </div>
          <Alert
            message={searchResult.explanation}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* AI推荐建议 */}
          {searchResult.recommendations && searchResult.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>
                <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                智能建议：
              </h4>
              <ul>
                {searchResult.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 找到的达人数量 */}
          <div className="result-count">
            共找到 <strong style={{ color: '#1890ff', fontSize: 18 }}>{searchResult.total}</strong> 个符合条件的达人
          </div>
        </Card>
      )}
    </div>
  );
};

export default NaturalLanguageSearch;

