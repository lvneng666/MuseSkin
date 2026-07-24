import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const assetsDir = path.resolve('assets');

async function processImages() {
    console.log('🚀 Starting automated image optimization...');
    const files = fs.readdirSync(assetsDir);
    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const file of files) {
        if (!file.endsWith('.png')) continue;
        const filePath = path.join(assetsDir, file);
        const stat = fs.statSync(filePath);
        totalOriginal += stat.size;

        const baseName = path.basename(file, '.png');
        const webpPath = path.join(assetsDir, `${baseName}.webp`);

        // Convert PNG to WebP with high quality compression
        await sharp(filePath)
            .webp({ quality: 82, effort: 6 })
            .toFile(webpPath);
        
        const webpStat = fs.statSync(webpPath);
        totalOptimized += webpStat.size;
        console.log(`✓ Converted ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB) -> ${baseName}.webp (${(webpStat.size / 1024).toFixed(1)} KB)`);

        // Special handling for favicon.png: resize to 32x32 compressed fallback
        if (file === 'favicon.png') {
            const resizedBuffer = await sharp(filePath)
                .resize(32, 32)
                .png({ compressionLevel: 9, quality: 80 })
                .toBuffer();
            fs.writeFileSync(filePath, resizedBuffer);
            console.log(`✓ Compressed favicon.png to 32x32 fallback (${(resizedBuffer.length / 1024).toFixed(1)} KB)`);
        }
    }

    console.log(`\n🎉 Image Optimization Complete! Total PNG size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB -> WebP total: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`);
}

processImages().catch(err => {
    console.error('❌ Error processing images:', err);
    process.exit(1);
});
