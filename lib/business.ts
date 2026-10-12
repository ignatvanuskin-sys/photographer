import businessJson from '@/content/business.json';
import { businessSchema, type Business } from './types';
import { computeEnabledSections } from './sections';

/**
 * Доступ к данным бизнеса. Все компоненты читают только этот модуль,
 * а не business.json напрямую — так схема проверяется один раз при импорте.
 *
 * Валидация «жёсткая»: если данные разъезжаются со схемой, сборка падает
 * (дублируется в scripts/validate-business.ts, который запускается перед build).
 */
export const business: Business = businessSchema.parse(businessJson);

export function sectionEnabled(id: Business['sections']['enabled'][number]): boolean {
  return business.sections.enabled.includes(id);
}

/** Все кадры портфолио одним списком — для галереи и лайтбокса */
export function allShots() {
  return business.portfolio.flatMap((series) =>
    series.photos.map((photo) => ({
      ...photo,
      seriesSlug: series.slug,
      seriesTitle: series.title,
      /** Категория кадра = категория серии, к которой он относится */
      category: series.category,
    })),
  );
}

/** Уникальные форматы (категории) для фильтров галереи — в порядке серий */
export function galleryCategories(): string[] {
  return [...new Set(business.portfolio.map((series) => series.category))];
}

export { computeEnabledSections };
