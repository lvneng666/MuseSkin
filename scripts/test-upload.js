import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// 配置从 .env 读取（R2_* 变量），不再依赖 r2.config.json
const endpoint = process.env.R2_ENDPOINT;
const bucketName = process.env.R2_BUCKET;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const customDomain = process.env.R2_CUSTOM_DOMAIN;

if (!endpoint || !bucketName || !accessKeyId || !secretAccessKey) {
    console.error('缺少 R2 配置：请在 .env 中设置 R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY');
    process.exit(1);
}

console.log('正在初始化 Cloudflare R2 S3 客户端...');
console.log('Endpoint:', endpoint);
console.log('Bucket:', bucketName);

const s3Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
});

async function testUpload() {
    try {
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = 'Hello from MuseSkin R2 Upload Test!';

        console.log(`准备上传测试文件: ${testFileName}...`);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: testFileName,
            Body: testContent,
            ContentType: 'text/plain'
        });

        const response = await s3Client.send(command);
        console.log('✅ 文件成功上传至 Cloudflare R2！');
        console.log('HTTP 状态码:', response.$metadata.httpStatusCode);
        console.log('访问 URL:', `${customDomain}/${testFileName}`);
    } catch (error) {
        console.error('❌ 上传失败，错误信息:', error);
    }
}

testUpload();
