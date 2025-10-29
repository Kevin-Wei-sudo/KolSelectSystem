/**
 * 格式化工具函数
 */

// 格式化数字（千分位）
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 格式化数字（万、亿）
export const formatNumberShort = (num) => {
  if (num === undefined || num === null) return '0';
  
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  } else {
    return num.toString();
  }
};

// 格式化百分比（后端已改为 1-100，前端不再 *100）
export const formatPercent = (num, decimals = 1) => {
  if (num === undefined || num === null) return '0%';
  const n = Number(num);
  if (Number.isNaN(n)) return '0%';
  // 直接按 0-100 的百分值展示
  return n.toFixed(decimals) + '%';
};

// 格式化分数颜色
export const getScoreColor = (score) => {
  if (score >= 85) return '#52c41a'; // 绿色
  if (score >= 70) return '#1890ff'; // 蓝色
  if (score >= 55) return '#faad14'; // 橙色
  return '#f5222d'; // 红色
};

// 格式化潜力等级颜色
export const getPotentialLevelColor = (level) => {
  const colors = {
    'S': '#f5222d',
    'A': '#fa8c16',
    'B': '#1890ff',
    'C': '#52c41a',
  };
  return colors[level] || '#d9d9d9';
};

// 格式化潜力等级文本
export const getPotentialLevelText = (level) => {
  const texts = {
    'S': 'S级 - 极高潜力',
    'A': 'A级 - 高潜力',
    'B': 'B级 - 中等潜力',
    'C': 'C级 - 基础潜力',
  };
  return texts[level] || level;
};

// 格式化日期
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 格式化价格范围
export const formatPriceRange = (min, max) => {
  return `¥${formatNumberShort(min)} - ¥${formatNumberShort(max)}`;
};

// 计算天数差
export const getDaysDiff = (dateString) => {
  if (!dateString) return 0;
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  return diff;
};

// 格式化相对时间
export const formatRelativeTime = (dateString) => {
  const days = getDaysDiff(dateString);
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return `${Math.floor(days / 365)}年前`;
};

export default {
  formatNumber,
  formatNumberShort,
  formatPercent,
  getScoreColor,
  getPotentialLevelColor,
  getPotentialLevelText,
  formatDate,
  formatPriceRange,
  getDaysDiff,
  formatRelativeTime,
};

