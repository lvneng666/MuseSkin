import sharp from 'sharp';
import path from 'path';

async function makeFaviconPng() {
    const svgPath = path.resolve('assets/favicon.svg');
    const pngPath = path.resolve('assets/favicon.png');
    await sharp(svgPath)
        .resize(64, 64)
        .png()
        .toFile(pngPath);
    console.log('✓ Generated assets/favicon.png from assets/favicon.svg');
}

makeFaviconPng().catch(err => {
    console.error(err);
    process.exit(1);
});
