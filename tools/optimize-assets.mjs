import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const destination = path.join(root, 'front-end', 'public', 'assets', 'los-pit');
const downloads = path.join(process.env.USERPROFILE || '', 'Downloads');
const assets = [
  { source: '254454ea-0cc6-4a3b-8286-5ba168cb1b12-removebg-preview.png', folder: 'logo', name: 'logo-los-pit', transparent: true },
  { source: 'ChatGPT Image 10 de ago. de 2026, 01_26_26.png', folder: 'hero', name: 'hero-team' },
  { source: 'ChatGPT Image 10 de ago. de 2026, 11_00_57.png', folder: 'professionals', name: 'professional-01' },
  { source: 'ChatGPT Image 10 de ago. de 2026, 11_00_48.png', folder: 'professionals', name: 'professional-02' },
  { source: 'ChatGPT Image 6 de ago. de 2026, 00_02_46 (10).png', folder: 'gallery', name: 'storefront' },
  { source: 'WhatsApp Image 2026-08-04 at 10.35.53.jpeg', folder: 'gallery', name: 'work-beard-contour' },
  { source: 'WhatsApp Image 2026-08-04 at 10.35.52.jpeg', folder: 'gallery', name: 'work-curly-mullet' },
  { source: 'WhatsApp Image 2026-07-28 at 20.29.17.jpeg', folder: 'gallery', name: 'work-waves-fade' },
  { source: 'WhatsApp Image 2026-07-28 at 20.29.16.jpeg', folder: 'gallery', name: 'work-kids-fade' },
  { source: 'WhatsApp Image 2026-07-28 at 20.29.14.jpeg', folder: 'gallery', name: 'work-curly-fade' },
  { source: 'WhatsApp Image 2026-08-04 at 21.44.25.jpeg', folder: 'gallery', name: 'work-design-cut' }
];

for (const asset of assets) {
  const source = path.join(downloads, asset.source);
  const outputDir = path.join(destination, asset.folder);
  await mkdir(outputDir, { recursive: true });
  if (asset.transparent) {
    await copyFile(source, path.join(outputDir, `${asset.name}.png`));
  } else {
    await sharp(source).webp({ quality: 93, smartSubsample: true }).toFile(path.join(outputDir, `${asset.name}.webp`));
    await sharp(source).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 92, smartSubsample: true }).toFile(path.join(outputDir, `${asset.name}-720.webp`));
  }
}

process.stdout.write(`Assets em uso otimizados em ${destination}\n`);
