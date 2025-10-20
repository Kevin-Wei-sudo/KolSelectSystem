import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatNumber, formatPercent, formatPriceRange } from './format';

/**
 * 导出为Excel
 */
export const exportToExcel = (influencers, filename = '达人列表') => {
  // 准备数据
  const data = influencers.map(inf => ({
    'ID': inf.id,
    '姓名': inf.name,
    '平台': inf.platform,
    '类目': inf.category,
    '性别': inf.gender,
    '粉丝数': inf.followers_count,
    '平均播放量': inf.avg_views,
    '互动率': (inf.engagement_rate * 100).toFixed(2) + '%',
    '完播率': (inf.completion_rate * 100).toFixed(2) + '%',
    '适配度评分': inf.scores.adaptability_score,
    '影响力评分': inf.scores.influence_score,
    '粉丝粘性评分': inf.scores.stickiness_score,
    '爆款潜力评分': inf.scores.potential_score,
    '潜力等级': inf.potential_level,
    '报价范围': formatPriceRange(inf.price_min, inf.price_max),
    '商单口碑': (inf.cooperation_reputation * 100).toFixed(0) + '%',
    '粉丝增长趋势': inf.fans_growth_trend,
    '认证': inf.verified ? '是' : '否',
    'MCN': inf.mcn || '无',
  }));

  // 创建工作簿
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '达人列表');

  // 设置列宽
  const colWidths = [
    { wch: 15 }, // ID
    { wch: 15 }, // 姓名
    { wch: 10 }, // 平台
    { wch: 10 }, // 类目
    { wch: 8 },  // 性别
    { wch: 12 }, // 粉丝数
    { wch: 12 }, // 播放量
    { wch: 10 }, // 互动率
    { wch: 10 }, // 完播率
    { wch: 12 }, // 适配度
    { wch: 12 }, // 影响力
    { wch: 14 }, // 粉丝粘性
    { wch: 14 }, // 爆款潜力
    { wch: 10 }, // 潜力等级
    { wch: 20 }, // 报价范围
    { wch: 12 }, // 商单口碑
    { wch: 12 }, // 增长趋势
    { wch: 8 },  // 认证
    { wch: 15 }, // MCN
  ];
  ws['!cols'] = colWidths;

  // 下载
  XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
};

/**
 * 导出对比报告为Excel
 */
export const exportComparisonToExcel = (comparison, filename = '达人对比报告') => {
  const { influencers, analysis } = comparison;

  // 基础信息对比
  const basicData = influencers.map(inf => ({
    '姓名': inf.name,
    '平台': inf.platform,
    '类目': inf.category,
    '粉丝数': inf.followers_count,
    '平均播放量': inf.avg_views,
    '互动率': (inf.engagement_rate * 100).toFixed(2) + '%',
    '完播率': (inf.completion_rate * 100).toFixed(2) + '%',
  }));

  // 评分对比
  const scoreData = influencers.map(inf => ({
    '姓名': inf.name,
    '适配度评分': inf.scores.adaptability_score,
    '影响力评分': inf.scores.influence_score,
    '粉丝粘性评分': inf.scores.stickiness_score,
    '爆款潜力评分': inf.scores.potential_score,
    '潜力等级': inf.potential_level,
  }));

  // 分析结果
  const analysisData = analysis.map(item => ({
    '姓名': item.influencer_name,
    '优势': item.strengths.join('、'),
    '劣势': item.weaknesses.join('、'),
    '推荐理由': item.recommendation,
  }));

  // 创建工作簿
  const wb = XLSX.utils.book_new();

  // 基础信息Sheet
  const ws1 = XLSX.utils.json_to_sheet(basicData);
  XLSX.utils.book_append_sheet(wb, ws1, '基础信息对比');

  // 评分对比Sheet
  const ws2 = XLSX.utils.json_to_sheet(scoreData);
  XLSX.utils.book_append_sheet(wb, ws2, '评分对比');

  // 分析结果Sheet
  const ws3 = XLSX.utils.json_to_sheet(analysisData);
  XLSX.utils.book_append_sheet(wb, ws3, 'AI分析结果');

  // 下载
  XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`);
};

/**
 * 导出为PDF（简化版本）
 */
export const exportToPDF = async (elementId, filename = '达人报告') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('未找到要导出的元素');
    }

    // 使用html2canvas截图
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${filename}_${Date.now()}.pdf`);

    return true;
  } catch (error) {
    console.error('PDF导出失败:', error);
    return false;
  }
};

export default {
  exportToExcel,
  exportComparisonToExcel,
  exportToPDF,
};

