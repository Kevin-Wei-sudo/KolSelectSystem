const crawlerService = require('../services/crawlerService');

// 执行爬取任务（后台）
async function executeCrawling() {
  try {
    const platforms = ['douyin', 'xiaohongshu', 'kuaishou', 'bilibili'];
    
    for (const platform of platforms) {
      await crawlerService.crawlPlatform(platform);
    }

    // 完成爬取
    await crawlerService.completeCrawling();
  } catch (error) {
    console.error('爬取过程错误:', error);
    crawlerService.addLog('error', '爬取失败', error.message);
  }
}

class CrawlerController {
  // 开始爬取
  async startCrawling(req, res) {
    try {
      const status = await crawlerService.startCrawling(req.body);
      
      // 在后台执行爬取任务
      executeCrawling();

      res.json({
        success: true,
        data: status,
        message: '爬虫已启动'
      });
    } catch (error) {
      console.error('启动爬虫错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 获取爬取状态
  async getStatus(req, res) {
    try {
      const status = crawlerService.getStatus();
      res.json({
        success: true,
        data: status,
        message: '获取成功'
      });
    } catch (error) {
      console.error('获取状态错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 停止爬取
  async stopCrawling(req, res) {
    try {
      crawlerService.stopCrawling();
      res.json({
        success: true,
        message: '爬虫已停止'
      });
    } catch (error) {
      console.error('停止爬虫错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // 重置状态
  async reset(req, res) {
    try {
      crawlerService.reset();
      res.json({
        success: true,
        message: '已重置'
      });
    } catch (error) {
      console.error('重置错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CrawlerController();

