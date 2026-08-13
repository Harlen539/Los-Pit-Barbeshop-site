import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const downloads = path.join(process.env.USERPROFILE || '', 'Downloads');
const outputDir = path.join(root, 'front-end', 'public', 'assets', 'los-pit', 'service-icons');
const originalDir = path.join(root, 'front-end', 'public', 'assets', 'los-pit', 'originals');
const icons = [
  { source: 'ChatGPT_Image_10_de_ago._de_2026__10_23_26__1_-removebg-preview.png', name: 'corte' },
  { source: 'ChatGPT_Image_10_de_ago._de_2026__10_23_26__2_-removebg-preview.png', name: 'navalhado' },
  { source: 'ChatGPT_Image_10_de_ago._de_2026__10_23_27__3_-removebg-preview.png', name: 'pezinho' },
  { source: 'ChatGPT_Image_10_de_ago._de_2026__10_23_28__4_-removebg-preview.png', name: 'barba' },
  { source: 'ChatGPT_Image_10_de_ago._de_2026__10_23_28__5_-removebg-preview.png', name: 'sobrancelha' },
  { source: 'ChatGPT Image 10 de ago. de 2026, 10_37_34.png', name: 'pigmentacao', darkBackground: true }
];

await mkdir(outputDir, { recursive: true });
await mkdir(originalDir, { recursive: true });

for (const icon of icons) {
  const source = path.join(downloads, icon.source);
  await copyFile(source, path.join(originalDir, `service-${icon.name}.png`));
  const pipeline = sharp(source).trim(icon.darkBackground
    ? { background: '#000000', threshold: 10 }
    : { background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 6 });
  await pipeline
    .resize({ width: 256, height: 256, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ lossless: true })
    .toFile(path.join(outputDir, `${icon.name}.webp`));
}

process.stdout.write(`Ícones de serviços otimizados em ${outputDir}\n`);
