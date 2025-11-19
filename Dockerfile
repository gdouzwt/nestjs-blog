# 1. 构建阶段 (Builder)
FROM node:25-alpine As builder

WORKDIR /app

# 先拷 package.json 利用缓存，不频繁变动依赖安装速度快
COPY package*.json ./
# 安装所有依赖 (包括 devDependencies 用于构建)
RUN npm install

COPY . .
# 编译 TypeScript -> JavaScript (生成 dist 目录)
RUN npm run build

# 2. 运行阶段 (Production)
FROM node:25-alpine

WORKDIR /app

# 只要生产依赖
COPY package*.json ./
RUN npm install --only=production

# 从 builder 阶段把编译好的 dist 拷过来
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "dist/main"]