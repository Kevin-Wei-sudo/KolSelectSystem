import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './TutorialPage.css';

const { Title } = Typography;

const TutorialPage = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 加载 Markdown 文档
    const loadMarkdown = async () => {
      try {
        const response = await fetch('/tutorial.md');
        if (!response.ok) {
          throw new Error('无法加载教程文档');
        }
        const content = await response.text();
        setMarkdownContent(content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载教程中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <div className="tutorial-page">
      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>
          📚 达人筛号系统使用教程
        </Title>
        <div className="markdown-content">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
};

export default TutorialPage;