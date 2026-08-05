# Peaffee (MuseSkin) — 独立站电商系统

Peaffee 植萃护肤品牌站，含 B2C 商城下单 + B2B 询盘，现已接入 Node 后端。

## 架构

```
浏览器 (index.html / shop.html / /admin)
        │ 同源 /api
        ▼
Node + Express (server/)        ← 托管静态 dist/ + API + 管理后台
 ├─ PostgreSQL（orders/order_items/products/users/inquiries）
 ├─ PayPal Checkout（信用卡经 PayPal）+ 西联汇款（线下人工确认）
 ├─ nodemailer 邮件（下单确认 / 收款 / 发货 / 询盘提醒 / 重置密码）
 └─ 启动时自动 db:migrate + db:seed（幂等）
```

## 本地开发

前置：Node 20+、Docker（或本地 PostgreSQL 18）。

```bash
cp .env.example .env          # 填好数据库/会话配置
docker run -d --name peaffee-pg \
  -e POSTGRES_USER=peaffee -e POSTGRES_PASSWORD=peaffee -e POSTGRES_DB=peaffee \
  -p 55432:5432 postgres:16-alpine   # 端口按需改，与 .env 的 DATABASE_URL 一致

npm install
npm run db:migrate            # 建表
npm run db:seed               # 导入 12 商品 + 管理员（.env 的 ADMIN_*）

npm run dev:server            # 后端 http://localhost:3000（自动重启）
npm run dev                   # 前端 Vite（/api 已代理到 3000）
```

- 前台商城：`http://localhost:5173/shop.html`
- 管理后台：`http://localhost:5173/admin`（登录用 .env 的 `ADMIN_EMAIL`/`ADMIN_PASSWORD`）

## 生产部署（Docker）

```bash
cp .env.example .env          # 填真实配置（见下）
docker compose up -d --build
```

启动后 `http://服务器IP/` 即是完整站点；compose 会自动建库、建表、导入种子。

### 必须填写的环境变量

| 分组 | 变量 | 说明 |
|---|---|---|
| 数据库 | `DB_USER/DB_PASSWORD/DB_NAME` | compose 内部自动拼 `DATABASE_URL`（连 `db` 服务），忽略 `.env` 里的本地 `DATABASE_URL` |
| 会话 | `SESSION_SECRET` | ≥16 位随机串；`COOKIE_SECURE=true`、`TRUST_PROXY=true`（HTTPS 边缘） |
| 管理员 | `ADMIN_EMAIL/ADMIN_PASSWORD` | 种子管理账号 |
| 邮件 | `SMTP_HOST/PORT/SECURE/USER/PASS`、`ADMIN_NOTIFY_EMAIL` | 下单/收款/发货/询盘提醒。留空则只打印日志不真发信 |
| PayPal | `PAYPAL_CLIENT_ID/SECRET`、`PAYPAL_MODE`、`PAYPAL_WEBHOOK_ID` | 在 developer.paypal.com 建 App；webhook 注册到 `https://你的域名/api/payments/paypal/webhook`。`MODE=sandbox` 先用沙箱验证 |
| 西联 | `WU_BENEFICIARY/BANK/ACCOUNT/SWIFT/CURRENCY` | 结算页展示给客户的收款指引 |
| R2 图片 | `R2_*`（迁移自旧 `r2.config.json`） | 把 `r2.config.json` 里的 `endpoint/bucketName/customDomain/accessKeyId/secretAccessKey` 填进 `.env` 后删除该文件 |

> **旧 `r2.config.json` 含明文密钥**，已加入 `.gitignore`。请把其中的值迁到 `.env` 后删除它，不要提交到仓库。

## 支付流程说明

- **PayPal / 信用卡**：顾客选 PayPal → PayPal 弹窗付款 → 服务端捕获 + webhook 双保险 → 订单 `paid`、库存扣减、邮件确认。信用卡无需 PayPal 账户。
- **西联汇款**：顾客看收款指引 → 选填上传凭证 → 管理后台人工核对 → 点 **Mark paid** → 订单 `paid`、库存扣减、邮件确认。

## 常用命令

```bash
npm run db:migrate      # 应用迁移
npm run db:seed         # 幂等导入商品 + 管理员
npm run db:reset        # 清库重建 + 重新种子
npm run build           # 构建前端到 dist/
```
