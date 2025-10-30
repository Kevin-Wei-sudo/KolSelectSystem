import React, { useState } from 'react';
import { Row, Col, Card, Tag, Space, Modal, Button } from 'antd';
import { HeartOutlined, CommentOutlined, ShareAltOutlined, FireFilled, PlayCircleOutlined } from '@ant-design/icons';
import { formatNumberShort, formatRelativeTime } from '../../utils/format';
import './WorksGallery.css';

const WorksGallery = ({ works }) => {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');

  const sanitizeUrl = (url) => {
    if (!url) return '';
    const s = String(url).trim();
    // 去掉首尾可能出现的反引号或引号
    return s.replace(/^`+|`+$/g, '').replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
  };

  const getVideoUrl = (work) => sanitizeUrl(work.video_url || work.videoUrl || '');
  const isDirectVideo = (url) => /\.(mp4|webm)$/i.test(url);
  const openPlayer = (work) => {
    const url = getVideoUrl(work);
    if (!url) return;
    setCurrentUrl(url);
    setCurrentTitle(work.title || '作品播放');
    setPlayerOpen(true);
  };
  const closePlayer = () => {
    setPlayerOpen(false);
    setCurrentUrl('');
    setCurrentTitle('');
  };

  return (
    <Row gutter={[16, 16]}>
      {works.map((work) => (
        <Col xs={24} sm={12} md={8} lg={6} key={work.id || work.video_url || work.videoUrl || work.cover}>
          <Card
            hoverable
            className="work-card"
            cover={
              <div className="work-cover">
                {/* 封面 + 播放按钮（小窗播放） */}
                <img
                  alt={work.title || '作品封面'}
                  src={sanitizeUrl(work.cover)}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openPlayer(work)}
                />
                <div className="play-overlay" onClick={() => openPlayer(work)}>
                  <PlayCircleOutlined style={{ fontSize: 28, color: '#fff' }} />
                </div>
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
                    <HeartOutlined /> {formatNumberShort(work.statistics?.digg_count ?? work.statistics?.diggCount ?? work.likes ?? 0)}
                  </span>
                  <span className="stat-item">
                    <CommentOutlined /> {formatNumberShort(work.statistics?.comment_count ?? work.statistics?.commentCount ?? work.comments ?? 0)}
                  </span>
                  <span className="stat-item">
                    <ShareAltOutlined /> {formatNumberShort(work.statistics?.share_count ?? work.statistics?.shareCount ?? work.shares ?? 0)}
                  </span>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      ))}

      {/* 小窗视频播放 */}
      <Modal
        open={playerOpen}
        onCancel={closePlayer}
        footer={[
          <Button key="open" type="link" href={currentUrl} target="_blank" rel="noopener noreferrer">
            在新窗口打开
          </Button>,
          <Button key="close" onClick={closePlayer}>关闭</Button>
        ]}
        title={currentTitle}
        width={560}
        centered
      >
        {isDirectVideo(currentUrl) ? (
          <video src={currentUrl} controls autoPlay style={{ width: '100%', borderRadius: 8 }} />
        ) : (
          <iframe
            src={currentUrl}
            title={currentTitle}
            style={{ width: '100%', height: 320, border: 0, borderRadius: 8 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </Modal>
    </Row>
  );
};

export default WorksGallery;

