# ==================== Build Stage ====================
FROM node:22-alpine AS build-stage
WORKDIR /app

# 安装前端依赖并构建静态产物
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ==================== Production Stage ====================
FROM node:22-alpine AS production-stage
WORKDIR /app
ENV NODE_ENV=production PORT=3000

# 只安装生产依赖（后端运行时所需）
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 后端源码 + 前端构建产物（由 Node 同时托管静态站与 /api）
COPY server ./server
COPY --from=build-stage /app/dist ./dist

EXPOSE 3000
CMD ["node", "server/index.js"]
