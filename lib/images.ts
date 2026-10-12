import manifest from '@/content/image-manifest.json';

/**
 * Доступ к данным оптимизированных изображений.
 *
 * content/image-manifest.json создаётся скриптом scripts/optimize-images.ts:
 * реальные размеры, dominant color и blur-превью для каждого исходника.
 * Файл коммитится в репозиторий, поэтому сборка не зависит от запуска скрипта.
 */

export type Variant = { width: number; avif: string; webp: string };

export type ImageMeta = {
  src: string;
  width: number;
  height: number;
  aspect: number;
  dominant: string;
  blurDataURL: string;
  variants: Variant[];
};

const MAP = manifest as Record<string, ImageMeta>;

const bySrc = new Map<string, ImageMeta>();
for (const [file, meta] of Object.entries(MAP)) {
  bySrc.set(meta.src, meta);
  bySrc.set(meta.src.replace('/original/', '/optimized/'), meta);
  bySrc.set(file, meta);
}

/** Метаданные по пути вида /images/original/2gis-01.jpg */
export function imageMeta(src: string): ImageMeta | null {
  return bySrc.get(src) ?? null;
}

export function allImageMeta(): ImageMeta[] {
  return Object.values(MAP);
}
