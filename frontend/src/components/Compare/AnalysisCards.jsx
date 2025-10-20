import React from 'react';
import { Row, Col, Card, Tag, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, BulbOutlined } from '@ant-design/icons';
import './AnalysisCards.css';

const AnalysisCards = ({ analysis }) => {
  return (
    <Row gutter={[16, 16]}>
      {analysis.map((item, index) => (
        <Col xs={24} md={12} lg={8} key={index}>
          <Card
            className="analysis-card card-shadow"
            title={<strong>{item.influencer_name}</strong>}
          >
            {/* 优势 */}
            <div className="analysis-section">
              <div className="section-title">
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                <span>优势</span>
              </div>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {item.strengths.map((strength, idx) => (
                  <div key={idx} className="analysis-item strength">
                    <Tag color="success">{strength}</Tag>
                  </div>
                ))}
              </Space>
            </div>

            {/* 劣势 */}
            <div className="analysis-section">
              <div className="section-title">
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                <span>劣势</span>
              </div>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {item.weaknesses.map((weakness, idx) => (
                  <div key={idx} className="analysis-item weakness">
                    <Tag color="error">{weakness}</Tag>
                  </div>
                ))}
              </Space>
            </div>

            {/* 推荐理由 */}
            <div className="analysis-section recommendation">
              <div className="section-title">
                <BulbOutlined style={{ color: '#faad14', fontSize: 16 }} />
                <span>推荐理由</span>
              </div>
              <div className="recommendation-text">
                {item.recommendation}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AnalysisCards;

