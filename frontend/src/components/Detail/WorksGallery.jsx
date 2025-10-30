import React from 'react';
import { Row, Col, Card, Tag, Space } from 'antd';
import { HeartOutlined, CommentOutlined, ShareAltOutlined, FireFilled } from '@ant-design/icons';
import { formatNumberShort, formatRelativeTime } from '../../utils/format';
import './WorksGallery.css';

const WorksGallery = ({ works }) => {
  const sanitizeUrl = (url) => {
    if (!url) return '';
    const s = String(url).trim();
    // 去掉首尾可能出现的反引号或引号
    return s.replace(/^`+|`+$/g, '').replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
  };

  return (
      <Row gutter={[16, 16]}>
        {works.map((work) => (
            <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
              <Card
                  hoverable
                  className="work-card"
                  cover={
                    <div className="work-cover">
                      {/* 点击封面跳转到视频链接（新窗口） */}
                      <a
                          href={sanitizeUrl(work.video_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'block' }}
                      >
                        <img alt={work.title || '作品封面'} src={sanitizeUrl(work.cover)} style={{ cursor: 'pointer' }} />
                      </a>
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
                    <HeartOutlined /> {formatNumberShort(work.statistics?.digg_count || 0)}
                  </span>
                      <span className="stat-item">
                    <CommentOutlined /> {formatNumberShort(work.statistics?.comment_count || 0)}
                  </span>
                      <span className="stat-item">
                    <ShareAltOutlined /> {formatNumberShort(work.statistics?.share_count || 0)}
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

