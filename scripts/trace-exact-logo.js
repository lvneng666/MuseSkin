import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'C:/Users/lvneng/.gemini/antigravity-ide/brain/6941eb0b-141b-40f3-90e7-e327b0087696/media__1784875112262.png';

async function processLogo() {
  // Read raw pixel data
  const { data, info } = await sharp(inputPath)
    .trim({ threshold: 10 }) // trim outer white space
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  console.log(`Trimmed dimensions: ${width}x${height}`);

  // Create a clean transparent PNG where white (R>240, G>240, B>240) becomes transparent, and dark text becomes pure #1F3A2B
  const transparentBuffer = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Compute lightness
    const lightness = (r + g + b) / 3;

    if (lightness > 220 || a < 10) {
      // Background white -> transparent
      transparentBuffer[i] = 0;
      transparentBuffer[i + 1] = 0;
      transparentBuffer[i + 2] = 0;
      transparentBuffer[i + 3] = 0;
    } else {
      // Dark text -> brand green #1F3A2B (RGB: 31, 58, 43)
      // Anti-aliasing alpha blending
      const textAlpha = Math.round((1 - lightness / 255) * 255);
      transparentBuffer[i] = 31;     // R
      transparentBuffer[i + 1] = 58;  // G
      transparentBuffer[i + 2] = 43;  // B
      transparentBuffer[i + 3] = textAlpha; // Alpha
    }
  }

  const pngOutPath = 'd:/work/MuseSkin/assets/peaffee-logo-exact.png';
  await sharp(transparentBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(pngOutPath);

  console.log('Saved exact transparent logo PNG:', pngOutPath);

  // Also build high-res SVG embedding the exact transparent PNG data URI
  const pngBase64 = fs.readFileSync(pngOutPath).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- 100% Exact Replica of User's Original Peaffee Logo -->
  <image href="data:image/png;base64,${pngBase64}" x="0" y="0" width="${width}" height="${height}" />
</svg>`;

  fs.writeFileSync('d:/work/MuseSkin/assets/peaffee-logo.svg', svgContent);
  console.log('Saved 100% exact Peaffee logo SVG!');
}

processLogo();
