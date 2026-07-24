# ==================== Build Stage ====================
FROM node:18-alpine AS build-stage
WORKDIR /app

# 复制依赖配置并安装依赖
COPY package*.json ./
RUN npm ci

# 复制项目源代码并打包
COPY . .
RUN npm run build

# ==================== Production Stage ====================
FROM nginx:alpine AS production-stage

# 将打包产物复制到 Nginx 托管目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
