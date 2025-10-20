import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Row, Col } from 'antd';

const FansProfileChart = ({ profile }) => {
  // 年龄分布饼图
  const ageOption = {
    title: {
      text: '年龄分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}%',
        },
        data: [
          { value: profile.age_0_17, name: '0-17岁' },
          { value: profile.age_18_24, name: '18-24岁' },
          { value: profile.age_25_34, name: '25-34岁' },
          { value: profile.age_35_plus, name: '35岁+' },
        ],
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666'],
      },
    ],
  };

  // 性别分布饼图
  const genderOption = {
    title: {
      text: '性别分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}%',
        },
        data: [
          { value: profile.gender_female, name: '女性' },
          { value: profile.gender_male, name: '男性' },
        ],
        color: ['#ff6b9d', '#1890ff'],
      },
    ],
  };

  // 地域分布柱状图
  const cityOption = {
    title: {
      text: '城市等级分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: '{b}: {c}%',
    },
    xAxis: {
      type: 'category',
      data: ['一线城市', '二线城市', '三线及以下'],
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        type: 'bar',
        data: [
          profile.cities_tier1,
          profile.cities_tier2,
          profile.cities_tier3_plus,
        ],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#69c0ff' },
            ],
          },
          borderRadius: [8, 8, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
        },
      },
    ],
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <ReactECharts option={ageOption} style={{ height: '280px' }} />
        </Col>
        <Col xs={24} md={12}>
          <ReactECharts option={genderOption} style={{ height: '280px' }} />
        </Col>
        <Col xs={24}>
          <ReactECharts option={cityOption} style={{ height: '280px' }} />
        </Col>
      </Row>
    </div>
  );
};

export default FansProfileChart;

