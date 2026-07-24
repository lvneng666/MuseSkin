import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const images = [
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/step_1_requirements_1784872107027.png', name: 'step-1-requirements' },
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/delivery_eco_shipment_1784872118006.png', name: 'delivery-eco-packaging' },
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pure_ingredient_lab_1784872131922.png', name: 'ingredient-assurance-lab' },
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pkg_glass_dropper_1784872141367.png', name: 'pkg-glass-dropper' },
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pkg_airless_pump_1784872159450.png', name: 'pkg-airless-pump' },
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pkg_amber_jar_1784872171432.png', name: 'pkg-amber-jar' },
  { src: 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/pkg_aluminum_tube_1784872185750.png', name: 'pkg-aluminum-tube' }
];

async function convert() {
  for (const img of images) {
    if (fs.existsSync(img.src)) {
      const outWebp = path.join('d:/work/MuseSkin/assets', `${img.name}.webp`);
      const outPng = path.join('d:/work/MuseSkin/assets', `${img.name}.png`);
      await sharp(img.src).resize(800, 500, { fit: 'cover' }).webp({ quality: 82 }).toFile(outWebp);
      fs.copyFileSync(img.src, outPng);
      console.log('Converted & Saved:', img.name);
    } else {
      console.error('File not found:', img.src);
    }
  }
}

convert();
