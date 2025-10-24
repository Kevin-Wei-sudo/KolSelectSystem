import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API错误:', error);
    return Promise.reject(error);
  }
);

// API方法
export const influencerAPI = {
  // 搜索达人
  search: (filters) => {
    return api.post('/influencers/search', filters);
  },

  // 获取达人详情
  getDetail: (id) => {
    return api.get(`/influencers/${id}`);
  },

  // 对比达人
  compare: (ids) => {
    return api.post('/influencers/compare', { ids });
  },

  // 获取筛选选项
  getFilterOptions: () => {
    return api.get('/influencers/options/filters');
  },

  // 获取统计信息
  getOverviewStats: () => {
    return api.get('/influencers/stats/overview');
  },
};

// 数据管理API
export const dataAPI = {
  // 重置Demo数据
  resetDemo: () => {
    return api.post('/data/reset-demo');
  },
  
  // 测试数据库连接
  testDatabase: () => {
    return api.get('/data/test-db');
  },
};

export default api;

