import React, { useState, useEffect } from 'react';
import { Input, Button, Space, Tag, Card, Alert, AutoComplete } from 'antd';
import { SearchOutlined, BulbOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';
import './NaturalLanguageSearch.css';

const { TextArea } = Input;

const NaturalLanguageSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await axios.get('/api/nlp/suggestions');
      if (response.data.success) {
        setSuggestions(response.data.data.map(text => ({ value: text })));
      }
    } catch (error) {
      console.error('加载搜索建议失败:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/nlp/search', { query });
      if (response.data.success) {
        setSearchResult(response.data.data);
        onSearch(response.data.data);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败：' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

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
            options={suggestions}
            value={query}
            onChange={setQuery}
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
            }
          >
            <TextArea
              placeholder="例如：帮我找10个小红书美妆类的女性达人，粉丝在10-50万，互动率要高，爆款潜力大..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-textarea"
            />
          </AutoComplete>
          
          <div className="search-actions">
            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
              className="search-button"
            >
              智能搜索
            </Button>
          </div>
        </div>

        {/* 搜索建议 */}
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
                onClick={() => handleSuggestionClick(item.value)}
              >
                {item.value}
              </Tag>
            ))}
          </Space>
        </div>
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

