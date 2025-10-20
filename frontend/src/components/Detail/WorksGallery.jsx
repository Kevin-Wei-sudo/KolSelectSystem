import React from 'react';
import { Row, Col, Card, Tag, Space } from 'antd';
import { EyeOutlined, HeartOutlined, CommentOutlined, ShareAltOutlined, FireFilled } from '@ant-design/icons';
import { formatNumberShort, formatRelativeTime } from '../../utils/format';
import './WorksGallery.css';

const WorksGallery = ({ works }) => {
  return (
    <Row gutter={[16, 16]}>
      {works.map((work) => (
        <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
          <Card
            hoverable
            className="work-card"
            cover={
              <div className="work-cover">
                <img alt={work.title} src={work.cover} />
                {work.is_explosive && (
                  <div className="explosive-badge">
                    <FireFilled /> 爆款
                  </div>
                )}
                {work.is_commercial && (
                  <div className="commercial-badge">
                    <Tag color="orange">商单</Tag>
                  </div>
                )}
              </div>
            }
          >
            <div className="work-info">
              <div className="work-title" title={work.title}>
                {work.title}
              </div>
              <div className="work-date">{formatRelativeTime(work.publish_date)}</div>
              <div className="work-stats">
                <Space size={12} wrap>
                  <span className="stat-item">
                    <EyeOutlined /> {formatNumberShort(work.views)}
                  </span>
                  <span className="stat-item">
                    <HeartOutlined /> {formatNumberShort(work.likes)}
                  </span>
                  <span className="stat-item">
                    <CommentOutlined /> {formatNumberShort(work.comments)}
                  </span>
                  <span className="stat-item">
                    <ShareAltOutlined /> {formatNumberShort(work.shares)}
                  </span>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default WorksGallery;

