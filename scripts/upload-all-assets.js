import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. 读取 r2.config.json 配置
const configPath = path.join(__dirname, '../r2.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const s3Client = new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
    }
});

// 根据扩展名获取 ContentType
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.webp': return 'image/webp';
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
    }
}

async function uploadAssets() {
    const assetsDir = path.join(__dirname, '../assets');
    const files = fs.readdirSync(assetsDir);

    console.log(`🚀 开始上传 ${files.length} 个静态资源到 Cloudflare R2 云存储...`);
    console.log(`存储桶: ${config.bucketName}`);
    console.log(`CDN 访问域名: ${config.customDomain}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        // 设置在 R2 中的存储路径 Key，如 "assets/hero.webp"
        const key = `assets/${file}`;
        const contentType = getContentType(filePath);
        const fileBuffer = fs.readFileSync(filePath);

        try {
            const command = new PutObjectCommand({
                Bucket: config.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType
            });

            await s3Client.send(command);
            const cdnUrl = `${config.customDomain}/${key}`;
            console.log(`✅ [${successCount + 1}/${files.length}] 上传成功: ${file} -> ${cdnUrl}`);
            successCount++;
        } catch (err) {
            console.error(`❌ [失败] ${file}:`, err.message);
            failCount++;
        }
    }

    console.log(`\n🎉 上传完毕！成功: ${successCount} 个，失败: ${failCount} 个。`);
}

uploadAssets();
