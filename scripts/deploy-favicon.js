import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function deployFavicons() {
    const svgPath = path.resolve('assets/favicon.svg');
    const pngPath = path.resolve('assets/favicon.png');
    const publicDir = path.resolve('public');

    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate 64x64 PNG
    await sharp(svgPath)
        .resize(64, 64)
        .png()
        .toFile(pngPath);
    console.log('✓ Generated assets/favicon.png');

    // Copy to public/
    fs.copyFileSync(svgPath, path.join(publicDir, 'favicon.svg'));
    fs.copyFileSync(pngPath, path.join(publicDir, 'favicon.png'));
    fs.copyFileSync(pngPath, path.join(publicDir, 'favicon.ico'));
    console.log('✓ Deployed favicon.svg, favicon.png, favicon.ico to public/ directory');
}

deployFavicons().catch(err => {
    console.error(err);
    process.exit(1);
});
