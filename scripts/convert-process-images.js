import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const brainDir = `C:\\Users\\lvneng\\.gemini\\antigravity-ide\\brain\\94bded0a-6bf9-407b-b0b9-fcc792f22d7c`;
const assetsDir = path.resolve('assets');

const imageMap = [
    { prefix: 'step_lab_sampling', target: 'step-2-lab.webp' },
    { prefix: 'step_packaging_design', target: 'step-3-packaging.webp' },
    { prefix: 'step_4_warm_production_cleanroom', target: 'step-4-production.webp' },
    { prefix: 'step_5_warm_qc', target: 'step-5-qc.webp' },
    { prefix: 'step_6_warm_shipping', target: 'step-6-shipping.webp' }
];

async function convertGenImages() {
    const brainFiles = fs.readdirSync(brainDir);
    for (const item of imageMap) {
        const matchingFile = brainFiles.find(f => f.startsWith(item.prefix) && f.endsWith('.png'));
        if (matchingFile) {
            const srcPath = path.join(brainDir, matchingFile);
            const destPath = path.join(assetsDir, item.target);
            await sharp(srcPath)
                .resize(800, 500, { fit: 'cover' })
                .webp({ quality: 84 })
                .toFile(destPath);
            console.log(`✓ Processed ${matchingFile} -> assets/${item.target}`);
        } else {
            console.warn(`⚠️ Warning: Could not find generated file starting with ${item.prefix}`);
        }
    }
}

convertGenImages().catch(err => {
    console.error(err);
    process.exit(1);
});
