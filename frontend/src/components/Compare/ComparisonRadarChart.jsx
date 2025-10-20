import React from 'react';
import ReactECharts from 'echarts-for-react';

const ComparisonRadarChart = ({ influencers }) => {
  // 生成不同的颜色
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      data: influencers.map(inf => inf.name),
      top: 'bottom',
      textStyle: {
        fontSize: 14,
      },
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
        data: influencers.map((inf, index) => ({
          value: [
            inf.scores.adaptability_score,
            inf.scores.influence_score,
            inf.scores.stickiness_score,
            inf.scores.potential_score,
          ],
          name: inf.name,
          areaStyle: {
            color: `${colors[index % colors.length]}33`, // 33 = 20% opacity in hex
          },
          lineStyle: {
            color: colors[index % colors.length],
            width: 2,
          },
          itemStyle: {
            color: colors[index % colors.length],
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '500px' }} />;
};

export default ComparisonRadarChart;

