import React from 'react';
import { Table, Tag, Rate } from 'antd';
import { formatDate, formatNumberShort } from '../../utils/format';

const CooperationHistory = ({ history }) => {
  const columns = [
    {
      title: '合作品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: '合作时间',
      dataIndex: 'cooperation_date',
      key: 'cooperation_date',
      width: 120,
      render: (text) => formatDate(text),
      sorter: (a, b) => new Date(a.cooperation_date) - new Date(b.cooperation_date),
    },
    {
      title: '内容类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text) => {
        const colors = {
          '图文': 'blue',
          '视频': 'green',
          '直播': 'red',
          '短视频': 'orange',
        };
        return <Tag color={colors[text] || 'default'}>{text}</Tag>;
      },
      filters: [
        { text: '图文', value: '图文' },
        { text: '视频', value: '视频' },
        { text: '直播', value: '直播' },
        { text: '短视频', value: '短视频' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: '播放量',
      dataIndex: 'views',
      key: 'views',
      width: 120,
      render: (text) => formatNumberShort(text),
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => (
        <div>
          <Rate disabled defaultValue={rating} />
          <span style={{ marginLeft: 8, color: '#faad14', fontWeight: 600 }}>
            {rating.toFixed(1)}
          </span>
        </div>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={history}
      rowKey={(record, index) => index}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
      }}
      scroll={{ x: 800 }}
    />
  );
};

export default CooperationHistory;

