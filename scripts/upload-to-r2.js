/**
 * Upload site assets to Cloudflare R2.
 * Usage: node scripts/upload-to-r2.js path/to/image.png
 * Reads credentials from the repo-root .env (R2_* variables).
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_CUSTOM_DOMAIN } = process.env;

if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('缺少 R2 配置：请在 .env 中设置 R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const MIME = {
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

for (const file of process.argv.slice(2)) {
  if (!fs.existsSync(file)) {
    console.error(`文件不存在: ${file}`);
    continue;
  }
  const body = fs.readFileSync(file);
  const key = `assets/${path.basename(file)}`;
  const contentType = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType }));
  const url = `${R2_CUSTOM_DOMAIN}/${key}`;
  console.log(`✅ uploaded ${key} → ${url}`);
}
