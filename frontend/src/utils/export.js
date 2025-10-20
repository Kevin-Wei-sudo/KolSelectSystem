import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatPriceRange } from './format';

/**
 * 导出为Excel
 */
export const exportToExcel = async (influencers, filename = '达人列表') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('达人列表');

  // 设置列
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 15 },
    { header: '姓名', key: 'name', width: 15 },
    { header: '平台', key: 'platform', width: 10 },
    { header: '类目', key: 'category', width: 10 },
    { header: '性别', key: 'gender', width: 8 },
    { header: '粉丝数', key: 'followers_count', width: 12 },
    { header: '平均播放量', key: 'avg_views', width: 12 },
    { header: '互动率', key: 'engagement_rate', width: 10 },
    { header: '完播率', key: 'completion_rate', width: 10 },
    { header: '适配度评分', key: 'adaptability_score', width: 12 },
    { header: '影响力评分', key: 'influence_score', width: 12 },
    { header: '粉丝粘性评分', key: 'stickiness_score', width: 14 },
    { header: '爆款潜力评分', key: 'potential_score', width: 14 },
    { header: '潜力等级', key: 'potential_level', width: 10 },
    { header: '报价范围', key: 'price_range', width: 20 },
    { header: '商单口碑', key: 'cooperation_reputation', width: 12 },
    { header: '粉丝增长趋势', key: 'fans_growth_trend', width: 12 },
    { header: '认证', key: 'verified', width: 8 },
    { header: 'MCN', key: 'mcn', width: 15 },
  ];

  // 添加数据
  influencers.forEach(inf => {
    worksheet.addRow({
      id: inf.id,
      name: inf.name,
      platform: inf.platform,
      category: inf.category,
      gender: inf.gender,
      followers_count: inf.followers_count,
      avg_views: inf.avg_views,
      engagement_rate: (inf.engagement_rate * 100).toFixed(2) + '%',
      completion_rate: (inf.completion_rate * 100).toFixed(2) + '%',
      adaptability_score: inf.scores.adaptability_score,
      influence_score: inf.scores.influence_score,
      stickiness_score: inf.scores.stickiness_score,
      potential_score: inf.scores.potential_score,
      potential_level: inf.potential_level,
      price_range: formatPriceRange(inf.price_min, inf.price_max),
      cooperation_reputation: (inf.cooperation_reputation * 100).toFixed(0) + '%',
      fans_growth_trend: inf.fans_growth_trend,
      verified: inf.verified ? '是' : '否',
      mcn: inf.mcn || '无',
    });
  });

  // 下载
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${Date.now()}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

/**
 * 导出对比报告为Excel
 */
export const exportComparisonToExcel = async (comparison, filename = '达人对比报告') => {
  const { influencers, analysis } = comparison;
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: 基础信息对比
  const ws1 = workbook.addWorksheet('基础信息对比');
  ws1.columns = [
    { header: '姓名', key: 'name', width: 15 },
    { header: '平台', key: 'platform', width: 10 },
    { header: '类目', key: 'category', width: 10 },
    { header: '粉丝数', key: 'followers_count', width: 12 },
    { header: '平均播放量', key: 'avg_views', width: 12 },
    { header: '互动率', key: 'engagement_rate', width: 10 },
    { header: '完播率', key: 'completion_rate', width: 10 },
  ];
  influencers.forEach(inf => {
    ws1.addRow({
      name: inf.name,
      platform: inf.platform,
      category: inf.category,
      followers_count: inf.followers_count,
      avg_views: inf.avg_views,
      engagement_rate: (inf.engagement_rate * 100).toFixed(2) + '%',
      completion_rate: (inf.completion_rate * 100).toFixed(2) + '%',
    });
  });

  // Sheet 2: 评分对比
  const ws2 = workbook.addWorksheet('评分对比');
  ws2.columns = [
    { header: '姓名', key: 'name', width: 15 },
    { header: '适配度评分', key: 'adaptability_score', width: 12 },
    { header: '影响力评分', key: 'influence_score', width: 12 },
    { header: '粉丝粘性评分', key: 'stickiness_score', width: 14 },
    { header: '爆款潜力评分', key: 'potential_score', width: 14 },
    { header: '潜力等级', key: 'potential_level', width: 10 },
  ];
  influencers.forEach(inf => {
    ws2.addRow({
      name: inf.name,
      adaptability_score: inf.scores.adaptability_score,
      influence_score: inf.scores.influence_score,
      stickiness_score: inf.scores.stickiness_score,
      potential_score: inf.scores.potential_score,
      potential_level: inf.potential_level,
    });
  });

  // Sheet 3: AI分析结果
  const ws3 = workbook.addWorksheet('AI分析结果');
  ws3.columns = [
    { header: '姓名', key: 'name', width: 15 },
    { header: '优势', key: 'strengths', width: 40 },
    { header: '劣势', key: 'weaknesses', width: 40 },
    { header: '推荐理由', key: 'recommendation', width: 50 },
  ];
  analysis.forEach(item => {
    ws3.addRow({
      name: item.influencer_name,
      strengths: item.strengths.join('、'),
      weaknesses: item.weaknesses.join('、'),
      recommendation: item.recommendation,
    });
  });

  // 下载
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${Date.now()}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
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

