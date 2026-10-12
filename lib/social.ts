import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { business } from './business';
import { imageMeta } from './images';
import { getSiteUrl } from './seo';

/**
 * Кадр для Open Graph / Twitter Card.
 *
 * Приоритет:
 *  1. public/og/og.jpg — собранный скриптом optimize-images.ts кадр 1200×630
 *     (лучший кадр + затемнение под текст);
 *  2. крупный WebP-вариант hero-кадра из лестницы оптимизации;
 *  3. исходный путь как есть.
 *
 * Название к картинке добавляют og:title и twitter:title.
 */
export function heroSocialImage(): string {
  const siteUrl = getSiteUrl();

  if (existsSync(join(process.cwd(), 'public', 'og', 'og.jpg'))) {
    return `${siteUrl}/og/og.jpg`;
  }

  const src = business.hero.desktop.src;
  const meta = imageMeta(src);
  if (!meta) return src.startsWith('http') ? src : `${siteUrl}${src}`;

  const preferred =
    [...meta.variants].reverse().find((v) => v.width >= 1200) ??
    meta.variants[meta.variants.length - 1];

  return `${siteUrl}${preferred.webp}`;
}
