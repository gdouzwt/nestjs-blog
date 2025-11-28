# ---------------------------
# 1. 构建阶段 (Builder)
# ---------------------------
FROM node:lts-alpine AS builder

WORKDIR /app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码并编译
COPY . .
# 这一步会生成 /app/dist 目录
RUN npm run build

# ---------------------------
# 2. 运行阶段 (Nginx)
# ---------------------------
FROM nginx:alpine

# 删除 Nginx 默认的 html
RUN rm -rf /usr/share/nginx/html/*

# 从 Builder 阶段把编译好的 dist 复制过来
COPY --from=builder /app/dist /usr/share/nginx/html

# 把当前目录下的 nginx.conf 复制进去替换默认配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]