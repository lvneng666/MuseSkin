import sharp from 'sharp';
import fs from 'fs';

const media1 = 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/media__1784874871152.png';
const media2 = 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/media__1784875112262.png';

async function check() {
  if (fs.existsSync(media2)) {
    const meta = await sharp(media2).metadata();
    console.log('Media2 Meta:', meta);
  } else if (fs.existsSync(media1)) {
    const meta = await sharp(media1).metadata();
    console.log('Media1 Meta:', meta);
  }
}
check();
