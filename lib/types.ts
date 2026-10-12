import { z } from 'zod';

/**
 * ЕДИНСТВЕННЫЙ ИСТОЧНИК ПРАВДЫ.
 *
 * Правило проекта: любое фактическое утверждение на сайте (цифра, цена, срок,
 * формат, адрес) обязано иметь запись в `_sources`. Всё неизвестное — `null`
 * или пустой массив. «Разумные» значения не подставляются.
 *
 * Файл проверяется scripts/validate-business.ts. Сборка падает,
 * если бизнес-данные не валидны.
 */

const nullableString = z.string().min(1).nullable().default(null);
const nullableNumber = z.number().nullable().default(null);

export const brandSchema = z.object({
  name: z.string().min(1),
  logo: nullableString,
  tagline: nullableString,
  /** Как специалист себя называет: «фотограф», «видеограф», «команда» */
  roles: z.array(z.string().min(1)).default([]),
  /** Один акцентный цвет; при null используется палитра по умолчанию */
  accentColor: nullableString,
});

export const contactsSchema = z.object({
  city: z.string().min(1),
  address: nullableString,
  /** Ориентир / локация: «Парк Астана», студия и т. п. */
  place: nullableString,
  geo: z
    .object({
      lat: nullableNumber,
      lng: nullableNumber,
    })
    .default({ lat: null, lng: null }),
  phone: nullableString,
  whatsapp: nullableString,
  telegram: nullableString,
  instagram: nullableString,
  taplink: nullableString,
  hours: nullableString,
  map2gis: nullableString,
  mapGoogle: nullableString,
});

export const serviceSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'id должен быть в kebab-case (латиница, цифры, дефис)'),
  title: z.string().min(1),
  description: nullableString,
  /** «Что входит» — только подтверждённые пункты. Пустой массив, если данных нет. */
  includes: z.array(z.string().min(1)).default([]),
  /** Цена «от» — только опубликованная. Не округлять и не придумывать. */
  from: nullableString,
});

export const packageItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  includes: z.array(z.string().min(1)).default([]),
  price: z.string().min(1),
  note: nullableString,
});

export const packagesSchema = z.object({
  /** true только если есть ОПУБЛИКОВАННЫЕ цены И состав */
  enabled: z.boolean().default(false),
  items: z.array(packageItemSchema).default([]),
});

export const portfolioItemSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug в kebab-case'),
  title: z.string().min(1),
  /** Формат съёмки, к которому относится серия */
  category: z.string().min(1),
  /** Путь к обложке внутри /public или абсолютный URL */
  cover: z.string().min(1),
  photos: z
    .array(
      z.object({
        src: z.string().min(1),
        alt: z.string().min(1),
        w: z.number().int().positive(),
        h: z.number().int().positive(),
        /** Комментарий только по тому, что видно в кадре */
        caption: nullableString,
      }),
    )
    .default([]),
  facts: z
    .object({
      place: nullableString,
      season: nullableString,
      format: nullableString,
    })
    .default({ place: null, season: null, format: null }),
});

const heroImageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
});

/**
 * Главный кадр. Выбор вертикального/горизонтального варианта — редакторское
 * решение, поэтому причина фиксируется в данных и в DATA_REPORT.md.
 */
export const heroSchema = z.object({
  desktop: heroImageSchema,
  mobile: heroImageSchema,
  reason: z.string().min(1),
});

export const videoSchema = z.object({
  /** Прямая ссылка на шоурил, только если файл доступен легально */
  showreel: nullableString,
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        /** Постер — честный кадр, без фейкового плеера */
        poster: nullableString,
        /** Ссылка на источник (например, публикация в Instagram) */
        href: nullableString,
        note: nullableString,
      }),
    )
    .default([]),
});

export const reviewSchema = z.object({
  author: z.string().min(1),
  /** Дословный текст отзыва. Не переписывать и не склеивать. */
  text: z.string().min(1),
  date: nullableString,
  sourceUrl: nullableString,
});

export const reviewsSchema = z.object({
  source: z.string().min(1),
  rating: nullableNumber,
  /** Количество оценок (со звёздами) */
  count: nullableNumber,
  /** Количество отзывов с текстом */
  reviewsCount: nullableNumber,
  items: z.array(reviewSchema).default([]),
});

export const processStepSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
});

export const faqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

export const termsSchema = z.object({
  prepayment: nullableString,
  delivery: nullableString,
  retouching: nullableString,
  /** Единственное поле с нейтральным дефолтом (разрешено ТЗ) */
  responseSla: z.string().min(1).default('в течение дня'),
});

export const seoSchema = z.object({
  title: nullableString,
  description: nullableString,
});

export const analyticsSchema = z.object({
  ga4: nullableString,
  ym: nullableString,
});

/** Идентификаторы секций — используются в sections.enabled */
export const SECTION_IDS = [
  'hero',
  'manifesto',
  'featuredWork',
  'gallery',
  'services',
  'process',
  'packages',
  'reviews',
  'about',
  'booking',
  'faq',
  'contacts',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const businessSchema = z.object({
  brand: brandSchema,
  contacts: contactsSchema,
  hero: heroSchema,
  services: z.array(serviceSchema).default([]),
  packages: packagesSchema,
  portfolio: z.array(portfolioItemSchema).default([]),
  video: videoSchema,
  reviews: reviewsSchema,
  process: z.array(processStepSchema).default([]),
  faq: z.array(faqItemSchema).default([]),
  terms: termsSchema,
  sections: z.object({
    enabled: z.array(z.enum(SECTION_IDS)),
  }),
  seo: seoSchema,
  analytics: analyticsSchema,
  mode: z.enum(['demo', 'production']),
  /**
   * Карта «путь в данных → откуда взято».
   * Например: "reviews.count": "2gis card, 12.10.2026"
   */
  _sources: z.record(z.string(), z.string()),
});

export type Business = z.infer<typeof businessSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type PortfolioItem = z.infer<typeof portfolioItemSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type SectionIdList = SectionId[];
