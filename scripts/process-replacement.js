import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const images = [
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pure_botanical_assurance_1784873236332.png', name: 'ingredient-assurance-lab' }
];

async function convert() {
  for (const img of images) {
    if (fs.existsSync(img.src)) {
      const outWebp = path.join('d:/work/MuseSkin/assets', `${img.name}.webp`);
      const outPng = path.join('d:/work/MuseSkin/assets', `${img.name}.png`);
      await sharp(img.src).resize(800, 500, { fit: 'cover' }).webp({ quality: 85 }).toFile(outWebp);
      fs.copyFileSync(img.src, outPng);
      console.log('Converted & Saved replacement:', img.name);
    } else {
      console.error('File not found:', img.src);
    }
  }
}

convert();
