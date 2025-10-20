const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const influencerRoutes = require('./routes/influencer');
const nlpRoutes = require('./routes/nlp');
const crawlerRoutes = require('./routes/crawler');
const schedulerRoutes = require('./routes/scheduler');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000 // 限制请求数
});
app.use(limiter);

// 路由
app.use('/api/influencers', influencerRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/crawler', crawlerRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/data', dataRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '达人筛号系统API运行中' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`达人筛号系统后端服务运行在端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;

