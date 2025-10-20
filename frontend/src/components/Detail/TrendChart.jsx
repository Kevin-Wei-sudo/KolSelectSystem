import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatNumberShort } from '../../utils/format';

const TrendChart = ({ followersTrend, viewsTrend }) => {
  const months = ['6个月前', '5个月前', '4个月前', '3个月前', '2个月前', '1个月前'];

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['粉丝数', '平均播放量'],
      top: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
    },
    yAxis: [
      {
        type: 'value',
        name: '粉丝数',
        position: 'left',
        axisLabel: {
          formatter: (value) => formatNumberShort(value),
        },
      },
      {
        type: 'value',
        name: '播放量',
        position: 'right',
        axisLabel: {
          formatter: (value) => formatNumberShort(value),
        },
      },
    ],
    series: [
      {
        name: '粉丝数',
        type: 'line',
        data: followersTrend,
        smooth: true,
        yAxisIndex: 0,
        itemStyle: {
          color: '#1890ff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
      },
      {
        name: '平均播放量',
        type: 'line',
        data: viewsTrend,
        smooth: true,
        yAxisIndex: 1,
        itemStyle: {
          color: '#52c41a',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '400px' }} />;
};

export default TrendChart;

