# Peaffee (MuseSkin) — 独立站电商系统（Java + Vue）

Peaffee 植萃护肤品牌站：**Spring Boot 3 后端 + Vue 3 SPA 前端**，含 B2C 商城下单、B2B 询盘、管理后台。
（上一版 Node.js 实现已存档在 git tag `node-legacy`。）

## 架构

```
浏览器 → Nginx（托管 Vue dist，/api 反代到 backend:8080）
              │
              ▼
Spring Boot 3（backend/，Java 17）  ── JWT 无状态认证
 ├─ JPA + Flyway → PostgreSQL（users/products/orders/order_items/inquiries）
 ├─ PayPal REST v2 + 西联汇款（文件上传 + 人工确认）
 ├─ Spring Mail + Thymeleaf（5 类邮件，无 SMTP 时日志降级）
 └─ 启动时幂等种子（12 商品 + 管理员）
```

- **前端**：Vue 3 + Vite + Vue Router + Pinia + axios（`src/`），复用原有 `style.css` / `shop.css` 保持视觉一致
- **后端**：Spring Boot 3.5（Maven，Java 17），Flyway 管理 schema，JWT 无状态认证，全局 snake_case JSON 契约

## 本地开发

前置：JDK 17、Maven 3.9、Node 20+、PostgreSQL（Docker）。

```bash
cp .env.example .env        # 填 DB_*、JWT_SECRET、ADMIN_*
# 1) 启动 PostgreSQL（或用自己的本地库）
docker run -d --name peaffee-pg -e POSTGRES_USER=peaffee -e POSTGRES_PASSWORD=peaffee \
  -e POSTGRES_DB=peaffee -p 55432:5432 postgres:16-alpine

# 2) 后端（http://localhost:8080，自动建表+种子）
cd backend
mvn -s mvn-settings.xml spring-boot:run   # 本机联网受限，用代理 settings；正常环境直接 mvn spring-boot:run
export DATABASE_URL=postgres://peaffee:peaffee@localhost:55432/peaffee
export JWT_SECRET=dev-secret-32bytes-min  ADMIN_EMAIL=admin@peaffee.com ADMIN_PASSWORD=adminpass123

# 3) 前端（http://localhost:5173，/api 代理到 8080）
cd .. && npm install && npm run dev
```

- 商城：`http://localhost:5173/shop`
- 管理后台：`http://localhost:5173/admin`（用 `ADMIN_EMAIL`/`ADMIN_PASSWORD` 登录）

## 生产部署（Docker）

```bash
cp .env.example .env        # 填真实配置（见下）
docker compose up -d --build
```

启动后 `http://服务器IP/` 即是完整站点。compose 含 db（postgres）+ backend（Spring Boot）+ frontend（nginx）。

> **后端镜像说明**：`backend/Dockerfile` 直接复制本地构建的 jar（本机联网受限时的务实做法）。正常 CI/CD 环境请用 `backend/Dockerfile.maven`（标准 maven 多阶段构建），或先在服务器上 `cd backend && mvn package` 再 `docker compose build`。

### 必须填写的环境变量

| 分组 | 变量 | 说明 |
|---|---|---|
| 数据库 | `DB_USER/DB_PASSWORD/DB_NAME` | compose 内部自动拼 `DATABASE_URL`（连 `db` 服务） |
| 后端 | `JWT_SECRET`（≥32 字节）、`ADMIN_EMAIL/ADMIN_PASSWORD` | JWT 签名 + 种子管理员 |
| 邮件 | `SMTP_HOST/PORT/USER/PASS`、`ADMIN_NOTIFY_EMAIL` | 5 类邮件；留空则打印 `[mail:disabled]` 日志 |
| PayPal | `PAYPAL_CLIENT_ID/SECRET`、`PAYPAL_MODE`、`PAYPAL_WEBHOOK_ID` | developer.paypal.com 建 App；webhook 注册到 `https://域名/api/payments/paypal/webhook` |
| 西联 | `WU_BENEFICIARY/BANK/ACCOUNT/SWIFT/CURRENCY` | 结算页展示给客户的收款指引 |
| R2 | `R2_*` | 图片上传；旧 `r2.config.json` 已 gitignore，把值迁到 `.env` 后删除 |

> **旧 `r2.config.json` 含明文密钥**，已被 `.gitignore` 忽略。请把其中的值迁到 `.env` 后删除它。

## 常用命令

```bash
# 后端（backend/ 目录）
mvn -s mvn-settings.xml spring-boot:run   # 本机；正常环境：mvn spring-boot:run
mvn -s mvn-settings.xml package           # 打 jar（Docker 用）

# 前端（根目录）
npm run dev       # Vite dev，/api 代理到 8080
npm run build     # 构建到 dist/
```

## API 契约

与存档的 Node 版一致（`{error}` 错误体、snake_case、小写状态枚举）。核心端点：
`/api/auth/*`（JWT）、`/api/products`、`/api/orders`（下单/查单）、`/api/payments/paypal/*`、`/api/inquiries`、`/api/admin/*`（管理员）。

> 消费端结算已简化为 **PayPal 单通道**（信用卡经 PayPal）。西联/银行转账相关的后端端点仍保留，供 B2B 大额线下业务使用，但不作为消费者结算选项。

## 上线前 Checklist

- [ ] **换掉全部占位信息**：`src/config/site.js` 里的邮箱/电话/WhatsApp/社媒，`.env` 里的 `WU_*`、`ADMIN_*`
- [ ] **真实价格**：后台把 12 个商品的演示价格改成实际定价
- [ ] **PayPal**：`.env` 填 `PAYPAL_CLIENT_ID/SECRET`，先用 `PAYPAL_MODE=sandbox` 走一遍完整付款，再切 `live`
- [ ] **邮件**：`.env` 填 `SMTP_*`，验证 5 类邮件真实送达
- [ ] **HTTPS**：生产务必上 HTTPS（Cloudflare 边缘或 Nginx 证书），并设 `JWT_SECRET` 为长随机串、改掉默认管理员密码
- [ ] **运费**：如需运费，设 `SHIPPING_FLAT_CENTS`（单位：分）与 `SHIPPING_FREE_THRESHOLD_CENTS`（满额包邮阈值，0=不启用）
- [ ] **浏览器全流程实测**：加购 → PayPal 沙箱付款 → 后台确认 → 发货，逐个走通
- [ ] **密钥**：`r2.config.json` 已删除，R2 凭据在 `.env` 的 `R2_*`（已 gitignore）
