/**
 * РАЗРАБОТЧЕСКИЙ ИНСТРУМЕНТ (не часть сайта).
 * Собирает контактные листы (сетка превью с подписями имён файлов),
 * чтобы быстро классифицировать кадры, не открывая их по одному.
 *
 * Запуск: npx tsx scripts/contact-sheet.ts
 */
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const ROOT = join(__dirname, '..');
const ORIGINALS = join(ROOT, 'public', 'images', 'original');
const OUT = join(ROOT, '.contact-sheets');

const COLS = 6;
const CELL = 300;
const LABEL_H = 26;

async function sheet(files: string[], outName: string) {
  const rows = Math.ceil(files.length / COLS);
  const width = COLS * CELL;
  const height = rows * (CELL + LABEL_H);

  const composites: sharp.OverlayOptions[] = [];

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const left = col * CELL;
    const top = row * (CELL + LABEL_H);

    const buf = await sharp(join(ORIGINALS, file))
      .resize(CELL, CELL, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    composites.push({ input: buf, left, top });

    const svg = Buffer.from(
      `<svg width="${CELL}" height="${LABEL_H}">
         <rect width="100%" height="100%" fill="#000000"/>
         <text x="6" y="18" font-family="monospace" font-size="15" fill="#ffffff">${i + 1}. ${basename(file)}</text>
       </svg>`,
    );
    composites.push({ input: svg, left, top: top + CELL });
  }

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 20, g: 20, b: 22 },
    },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(join(OUT, outName));

  console.log(`✓ ${outName}  (${files.length} кадров)`);
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  const all = readdirSync(ORIGINALS)
    .filter((f) => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase()))
    .sort();

  const gis = all.filter((f) => f.startsWith('2gis'));
  const ig = all.filter((f) => f.startsWith('ig'));

  await sheet(gis, 'sheet-2gis.jpg');
  await sheet(ig, 'sheet-instagram.jpg');
}

void main();
