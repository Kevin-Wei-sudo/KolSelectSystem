import React from 'react';
import { Card, Space } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import './PredictionReasons.css';

const PredictionReasons = ({ reasons }) => {
  return (
    <Card
      size="small"
      className="prediction-reasons-card"
      title={
        <Space>
          <BulbOutlined style={{ color: '#faad14' }} />
          <span>AI预测理由</span>
        </Space>
      }
    >
      <div className="reasons-list">
        {reasons.map((reason, index) => (
          <div key={index} className="reason-item">
            {reason}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PredictionReasons;

