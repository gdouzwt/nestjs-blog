# ---------------------------
# 1. 构建阶段 (Builder)
# ---------------------------
# 建议改用 LTS 版本 (如 22 或 24)，这里暂且保留你的 25，但面试建议提 LTS
FROM node:lts-alpine AS builder

WORKDIR /app

# 设置国内镜像源 (可选，如果服务器在国内构建会快很多)
# RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

# 🌟 优化点 1: 使用 npm ci 而不是 install
# npm ci 会严格按照 package-lock.json 安装，确保版本绝对一致，这叫 "Immutable Builds"
RUN npm ci

COPY . .

RUN npm run build

# ---------------------------
# 2. 运行阶段 (Production)
# ---------------------------
FROM node:lts-alpine

# 🌟 优化点 2: 设置时区 (解决日志少8小时问题)
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

WORKDIR /app

COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 👇 关键修复 1：将配置文件从宿主机拷贝到容器中
# Docker Compose CLI 需要这个文件来知道如何连接数据库
COPY typeorm.config.ts /app/typeorm.config.ts

# 👇 关键修复 2：将 ts-node 等开发运行所需的依赖从 builder 阶段拷贝过来
# 这一步保证了 typeorm-ts-node-commonjs 命令能运行
COPY --from=builder /app/node_modules/ts-node /app/node_modules/ts-node
COPY --from=builder /app/node_modules/typeorm-ts-node-commonjs /app/node_modules/typeorm-ts-node-commonjs

# 暴露端口
EXPOSE 3721

# 🌟 优化点 3: 安全性提升 - 切换到非 root 用户
USER node

# 启动
CMD ["node", "dist/src/main"]