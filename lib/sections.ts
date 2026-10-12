import { businessSchema, SECTION_IDS, type Business, type SectionId } from './types';

/**
 * Условия появления секций (раздел 7 ТЗ).
 * Секция без данных не рендерится: список enabled вычисляется из данных,
 * а не задаётся вручную. scripts/validate-business.ts падает, если
 * сохранённый список расходится с вычисленным.
 */
export function computeEnabledSections(b: Business): SectionId[] {
  const enabled = new Set<SectionId>();

  // Hero, Process, BookingForm, Contacts — всегда
  enabled.add('hero');
  enabled.add('process');
  enabled.add('booking');
  enabled.add('contacts');

  // Manifesto — есть слоган или био (1–2 предложения из данных)
  if (b.brand.tagline) enabled.add('manifesto');

  const shots = b.portfolio.reduce((n, s) => n + s.photos.length, 0);

  // FeaturedWork — >= 4 серии ИЛИ >= 12 кадров
  if (b.portfolio.length >= 4 || shots >= 12) enabled.add('featuredWork');

  // Gallery — >= 12 кадров
  if (shots >= 12) enabled.add('gallery');

  // Services — >= 2 формата
  if (b.services.length >= 2) enabled.add('services');

  // Packages — только при публичных ценах и составе
  if (b.packages.enabled && b.packages.items.length > 0) enabled.add('packages');

  // Reviews — >= 3 реальных отзыва
  if (b.reviews.items.length >= 3) enabled.add('reviews');

  // About — есть данные о специалисте/команде
  if (b.brand.roles.length > 0 && b.contacts.place) enabled.add('about');

  // FAQ — >= 5 вопросов
  if (b.faq.length >= 5) enabled.add('faq');

  // Возвращаем в каноническом порядке SECTION_IDS, чтобы сравнение было стабильным
  return SECTION_IDS.filter((id) => enabled.has(id));
}

/**
 * Отдельные страницы серий (/work/[slug]) включаются только если
 * минимум 4 серии содержат по 6+ кадров — иначе смотреть нечего,
 * и серия открывается в лайтбоксе.
 */
export function hasSeriesPages(b: Business): boolean {
  return b.portfolio.filter((s) => s.photos.length >= 6).length >= 4;
}

export function seriesHasOwnPage(b: Business, item: { photos: unknown[] }): boolean {
  return hasSeriesPages(b) && item.photos.length >= 6;
}

export function isEnabled(b: Business, id: SectionId): boolean {
  return b.sections.enabled.includes(id);
}
