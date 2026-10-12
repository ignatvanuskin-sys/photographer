/**
 * Пайплайн изображений.
 *
 *   public/images/original/*.jpg   ← исходники (скачаны из публичных источников)
 *   public/images/optimized/*.avif|webp  ← ширины 480 / 960 / 1600 / 2400
 *   scripts/.image-manifest.json   ← размеры и dominant color для плейсхолдеров
 *
 * Запуск: npm run optimize
 *
 * Плейсхолдеры: в манифест пишется dominant color (sharp .stats()),
 * компонент <Shot> использует его как подложку вместо «скелетона».
 */
import { mkdirSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const ROOT = join(__dirname, '..');
const ORIGINALS = join(ROOT, 'public', 'images', 'original');
const OUT = join(ROOT, 'public', 'images', 'optimized');
const MANIFEST = join(ROOT, 'content', 'image-manifest.json');

const WIDTHS = [480, 960, 1600, 2400];
const INPUT_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export type ImageEntry = {
  src: string;
  width: number;
  height: number;
  aspect: number;
  dominant: string;
  /** Крошечный превью-кадр для placeholder="blur" в next/image */
  blurDataURL: string;
  variants: { width: number; avif: string; webp: string }[];
};

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

async function processOne(file: string): Promise<ImageEntry | null> {
  const full = join(ORIGINALS, file);
  const base = basename(file, extname(file)).replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

  const image = sharp(full, { failOn: 'none' });
  const meta = await image.metadata();
  if (!meta.width || !meta.height) {
    console.warn(`  ⚠ ${file} — не удалось прочитать размеры, пропуск`);
    return null;
  }

  const stats = await image.stats();
  // sharp отдаёт dominant как { r, g, b }; старые версии — как кортеж.
  const d = stats.dominant as unknown as
    | { r: number; g: number; b: number }
    | [number, number, number];
  const [r, g, b] = Array.isArray(d) ? d : [d.r, d.g, d.b];
  const dominant = toHex(r, g, b);

  // Реальный blur-превью (12 px по короткой стороне) → base64 dataURL
  const blurBuf = await sharp(full)
    .resize({ width: 12, withoutEnlargement: true })
    .webp({ quality: 30 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuf.toString('base64')}`;

  const variants: ImageEntry['variants'] = [];

  for (const width of WIDTHS) {
    // Не увеличиваем то, что меньше целевой ширины
    const target = Math.min(width, meta.width);
    if (variants.some((v) => v.width === target)) continue;

    const name = `${base}-${target}`;
    const avifPath = join(OUT, `${name}.avif`);
    const webpPath = join(OUT, `${name}.webp`);

    await sharp(full)
      .resize({ width: target, withoutEnlargement: true })
      .avif({ quality: 52, effort: 4 })
      .toFile(avifPath);

    await sharp(full)
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(webpPath);

    variants.push({
      width: target,
      avif: `/images/optimized/${name}.avif`,
      webp: `/images/optimized/${name}.webp`,
    });
  }

  variants.sort((a, b2) => a.width - b2.width);

  console.log(
    `  ✓ ${file.padEnd(16)} ${meta.width}×${meta.height}  →  ${variants.map((v) => v.width).join('/')}  ${dominant}`,
  );

  return {
    src: `/images/original/${file}`,
    width: meta.width,
    height: meta.height,
    aspect: Number((meta.width / meta.height).toFixed(4)),
    dominant,
    blurDataURL,
    variants,
  };
}

/**
 * Open Graph / Twitter Card: 1200×630 JPEG из лучшего кадра.
 *
 * Генерируется статикой, а не через динамический app/opengraph-image.tsx:
 * рантайм next/og (@vercel/og) не умеет разбирать собственный путь, если в
 * пути проекта есть пробелы и не-ASCII символы, — сборка падала на Windows.
 * Статический файл решает задачу надёжнее и не тянет edge-рантайм.
 * Название к кадру добавляется средствами og:title / twitter:title.
 */
async function generateOgImage(manifest: Record<string, ImageEntry>) {
  const heroFile = Object.entries(manifest).find(([file]) => file === '2gis-24.jpg');
  if (!heroFile) {
    console.warn('  ⚠ OG-кадр не найден (ожидался 2gis-24.jpg)');
    return;
  }

  const outDir = join(ROOT, 'public', 'og');
  mkdirSync(outDir, { recursive: true });

  const scrim = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
           <stop offset="0%" stop-color="#0E0E0F" stop-opacity="0.92"/>
           <stop offset="45%" stop-color="#0E0E0F" stop-opacity="0.55"/>
           <stop offset="100%" stop-color="#0E0E0F" stop-opacity="0.10"/>
         </linearGradient>
       </defs>
       <rect width="1200" height="630" fill="url(#g)"/>
     </svg>`,
  );

  await sharp(join(ORIGINALS, heroFile[0]))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([{ input: scrim, top: 0, left: 0 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(outDir, 'og.jpg'));

  console.log('  ✓ og/og.jpg      1200×630 (кадр + затемнение под текст)');
}

async function main() {
  if (!existsSync(ORIGINALS)) {
    console.error(`✖ Нет папки ${ORIGINALS}`);
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  const files = readdirSync(ORIGINALS)
    .filter((f) => INPUT_EXT.has(extname(f).toLowerCase()))
    .filter((f) => statSync(join(ORIGINALS, f)).size > 5_000)
    .sort();

  console.log(`\nОптимизация ${files.length} исходников → ${OUT}\n`);

  const manifest: Record<string, ImageEntry> = {};
  let total = 0;

  for (const file of files) {
    try {
      const entry = await processOne(file);
      if (entry) {
        manifest[file] = entry;
        total += 1;
      }
    } catch (e) {
      console.warn(`  ⚠ ${file} — ошибка: ${(e as Error).message}`);
    }
  }

  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await generateOgImage(manifest);

  console.log(`\n✔ Готово: ${total} изображений`);
  console.log(`  манифест: content/image-manifest.json`);
  console.log(`  вариантов на кадр: до ${WIDTHS.length} (avif + webp)\n`);
}

void main();
