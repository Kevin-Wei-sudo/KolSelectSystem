# 多阶段构建 Dockerfile
# 阶段1: 构建前端
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 阶段2: 构建 Spring Boot 应用
FROM gradle:9.1.0-jdk25 AS spring-build
WORKDIR /app/spring

COPY creator-data-management/build.gradle ./
COPY creator-data-management/settings.gradle ./
COPY creator-data-management/gradle/ gradle/
RUN gradle dependencies --no-daemon
COPY creator-data-management/src/ src/
RUN gradle bootJar --no-daemon

# 阶段3: 运行时镜像
FROM eclipse-temurin:25-jre-jammy AS runtime
WORKDIR /app

# 安装 Node.js 和 Nginx
RUN apt-get update && apt-get install -y curl nginx && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# 不需要 Node.js 后端，主要后端是 Spring Boot

# 复制构建好的前端文件
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 复制构建好的 Spring Boot JAR
COPY --from=spring-build /app/spring/build/libs/*.jar ./spring/app.jar

# 复制数据文件到运行时环境
COPY creator-data-management/src/main/resources/static/data/ ./spring/data/

# 配置 Nginx
RUN mkdir -p /etc/nginx/sites-available && \
    rm -f /etc/nginx/sites-enabled/default
COPY <<EOF /etc/nginx/sites-available/default
server {
    listen 40000;
    server_name localhost;
    
    # 前端静态文件
    location / {
        root /app/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }
    
    # 代理 Spring Boot API（主要后端）
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# 创建启动脚本
COPY <<EOF /app/start.sh
#!/bin/sh
set -e

# 启动 Spring Boot 应用
echo "Starting Spring Boot application..."
java -jar -Dspring.profiles.active=dev /app/spring/app.jar &

# Node.js 后端已移除，只使用 Spring Boot

# 启动 Nginx
echo "Starting Nginx..."
nginx -g 'daemon off;' &

# 等待所有进程
wait
EOF

RUN chmod +x /app/start.sh

# 暴露端口
EXPOSE 40000

# 启动命令
CMD ["/app/start.sh"]