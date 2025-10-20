import React from 'react';
import ReactECharts from 'echarts-for-react';

const ScoreRadarChart = ({ scores }) => {
  const option = {
    tooltip: {
      trigger: 'item',
    },
    radar: {
      indicator: [
        { name: '适配度', max: 100 },
        { name: '影响力', max: 100 },
        { name: '粉丝粘性', max: 100 },
        { name: '爆款潜力', max: 100 },
      ],
      radius: '65%',
      splitNumber: 5,
      axisName: {
        color: '#262626',
        fontSize: 14,
        fontWeight: 600,
      },
      splitLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
      splitArea: {
        areaStyle: {
          color: ['#fff', '#fafafa', '#f5f5f5'],
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              scores.adaptability_score,
              scores.influence_score,
              scores.stickiness_score,
              scores.potential_score,
            ],
            name: '评分',
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.3)',
            },
            lineStyle: {
              color: '#1890ff',
              width: 3,
            },
            itemStyle: {
              color: '#1890ff',
            },
          },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '400px' }} />;
};

export default ScoreRadarChart;

