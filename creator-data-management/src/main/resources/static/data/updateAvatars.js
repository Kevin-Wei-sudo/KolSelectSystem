const fs = require('fs');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateAvatars(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      console.error(`[ERROR] ${filePath} 不是数组格式，跳过`);
      return;
    }
    let updated = 0;
    for (const item of data) {
      const x = randomInt(1, 300);
      item.avatar = `https://linkgen.obs.cn-east-3.myhuaweicloud.com/RandomAvatar/${x}.jpg`;
      updated++;
    }
    const formatted = JSON.stringify(data, null, 2) + '\n';
    fs.writeFileSync(filePath, formatted, 'utf8');
    console.log(`[OK] 已更新 ${updated} 条 avatar -> ${filePath}`);
  } catch (err) {
    console.error(`[ERROR] 处理 ${filePath} 失败:`, err.message);
  }
}

const files = [
  '/Users/songyifan/Desktop/JAVA-Projects/KolSelectSystem/creator-data-management/src/main/resources/static/data/mock-data-douyin.json',
  '/Users/songyifan/Desktop/JAVA-Projects/KolSelectSystem/creator-data-management/src/main/resources/static/data/mock-data-xiaohongshu.json',
];

for (const f of files) {
  updateAvatars(f);
}