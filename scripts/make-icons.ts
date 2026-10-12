/**
 * Иконки сайта: app/icon.svg, app/apple-icon.png и public/favicon.ico.
 *
 * Аудит прода нашёл GET /favicon.ico → 404 (причём дважды на загрузку):
 * <link rel="icon"> отсутствовал вовсе. Здесь иконка собирается один раз
 * и коммитится — Next.js сам подхватывает icon.svg и apple-icon.png
 * из папки app и добавляет нужные теги.
 *
 * Знак — геометрический (кольцо объектива + точка), без шрифтов:
 * так он одинаково выглядит в любом окружении и читается на 16 px.
 *
 * Запуск: npm run icons
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(__dirname, '..');

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0E0E0F"/>
  <circle cx="32" cy="32" r="17" fill="none" stroke="#C9A96A" stroke-width="4"/>
  <circle cx="32" cy="32" r="6" fill="#C9A96A"/>
</svg>
`;

/** Обёртка PNG в контейнер ICO (ICO допускает встроенный PNG). */
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(1, 4); // количество изображений

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // ширина
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // высота
  entry.writeUInt8(0, 2); // цветов в палитре
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // бит на пиксель
  entry.writeUInt32LE(png.length, 8); // размер данных
  entry.writeUInt32LE(22, 12); // смещение данных

  return Buffer.concat([header, entry, png]);
}

async function main() {
  mkdirSync(join(ROOT, 'app'), { recursive: true });
  mkdirSync(join(ROOT, 'public'), { recursive: true });

  // 1. SVG — основной файл, Next отдаёт его как <link rel="icon" type="image/svg+xml">
  writeFileSync(join(ROOT, 'app', 'icon.svg'), SVG, 'utf8');
  console.log('  ✓ app/icon.svg');

  // 2. PNG для iOS (домашний экран)
  await sharp(Buffer.from(SVG))
    .resize(180, 180)
    .png()
    .toFile(join(ROOT, 'app', 'apple-icon.png'));
  console.log('  ✓ app/apple-icon.png   180×180');

  // 3. favicon.ico — его запрашивают браузеры и краулеры напрямую
  const png32 = await sharp(Buffer.from(SVG)).resize(32, 32).png().toBuffer();
  writeFileSync(join(ROOT, 'public', 'favicon.ico'), pngToIco(png32, 32));
  console.log('  ✓ public/favicon.ico   32×32 (PNG в контейнере ICO)');

  // 4. PNG 512 — пригодится для PWA/соцсетей
  await sharp(Buffer.from(SVG))
    .resize(512, 512)
    .png()
    .toFile(join(ROOT, 'public', 'icon-512.png'));
  console.log('  ✓ public/icon-512.png  512×512');
}

void main();
