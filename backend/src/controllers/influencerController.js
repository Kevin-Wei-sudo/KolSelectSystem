const influencerService = require('../services/influencerService');

class InfluencerController {
  // 筛选达人
  async searchInfluencers(req, res) {
    try {
      const filters = req.body;
      const result = await influencerService.searchInfluencers(filters);
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        message: '筛选成功'
      });
    } catch (error) {
      console.error('筛选达人错误:', error);
      res.status(500).json({
        success: false,
        message: '筛选失败',
        error: error.message
      });
    }
  }

  // 获取达人详情
  async getInfluencerDetail(req, res) {
    try {
      const { id } = req.params;
      const influencer = await influencerService.getInfluencerById(id);
      
      if (!influencer) {
        return res.status(404).json({
          success: false,
          message: '达人不存在'
        });
      }

      res.json({
        success: true,
        data: influencer,
        message: '获取成功'
      });
    } catch (error) {
      console.error('获取达人详情错误:', error);
      res.status(500).json({
        success: false,
        message: '获取失败',
        error: error.message
      });
    }
  }

  // 对比达人
  async compareInfluencers(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length < 2 || ids.length > 5) {
        return res.status(400).json({
          success: false,
          message: '请选择2-5个达人进行对比'
        });
      }

      const result = await influencerService.compareInfluencers(ids);
      res.json({
        success: true,
        data: result,
        message: '对比成功'
      });
    } catch (error) {
      console.error('对比达人错误:', error);
      res.status(500).json({
        success: false,
        message: '对比失败',
        error: error.message
      });
    }
  }

  // 获取筛选选项
  async getFilterOptions(req, res) {
    try {
      const options = await influencerService.getFilterOptions();
      res.json({
        success: true,
        data: options,
        message: '获取成功'
      });
    } catch (error) {
      console.error('获取筛选选项错误:', error);
      res.status(500).json({
        success: false,
        message: '获取失败',
        error: error.message
      });
    }
  }

  // 获取统计信息
  async getOverviewStats(req, res) {
    try {
      const stats = await influencerService.getOverviewStats();
      res.json({
        success: true,
        data: stats,
        message: '获取成功'
      });
    } catch (error) {
      console.error('获取统计信息错误:', error);
      res.status(500).json({
        success: false,
        message: '获取失败',
        error: error.message
      });
    }
  }
}

module.exports = new InfluencerController();

