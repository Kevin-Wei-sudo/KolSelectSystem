#!/bin/bash

echo "================================================"
echo "  达人筛号系统 - 启动脚本"
echo "================================================"
echo ""

# 检查数据文件是否存在
if [ ! -f "data/influencers.json" ]; then
    echo "⚠️  数据文件不存在，正在生成模拟数据..."
    cd backend
    node scripts/generateData.js
    cd ..
    echo "✅ 数据生成完成"
    echo ""
fi

# 启动后端服务
echo "🚀 正在启动后端服务..."
cd backend
npm start &
BACKEND_PID=$!
cd ..
echo "✅ 后端服务已启动 (PID: $BACKEND_PID) - http://localhost:3001"
echo ""

# 等待后端启动
sleep 3

# 启动前端服务
echo "🚀 正在启动前端服务..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID) - http://localhost:3000"
echo ""

echo "================================================"
echo "  所有服务已启动！"
echo "================================================"
echo "  前端地址: http://localhost:3000"
echo "  后端地址: http://localhost:3001"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "================================================"

# 等待用户中断
wait

