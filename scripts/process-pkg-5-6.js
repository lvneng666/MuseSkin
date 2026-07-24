import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const images = [
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pkg_ampoule_1784874084452.png', name: 'pkg-ampoule' },
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pkg_refillable_pod_1784874098805.png', name: 'pkg-refillable-pod' }
];

async function convert() {
  for (const img of images) {
    if (fs.existsSync(img.src)) {
      const outWebp = path.join('d:/work/MuseSkin/assets', `${img.name}.webp`);
      const outPng = path.join('d:/work/MuseSkin/assets', `${img.name}.png`);
      await sharp(img.src).resize(800, 500, { fit: 'cover' }).webp({ quality: 85 }).toFile(outWebp);
      fs.copyFileSync(img.src, outPng);
      console.log('Converted & Saved packaging cards 5 and 6:', img.name);
    } else {
      console.error('File not found:', img.src);
    }
  }
}

convert();
