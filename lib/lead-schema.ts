import { z } from 'zod';
import { isValidKzPhone, normalizeKzPhone } from './phone';

/**
 * Серверная валидация заявки.
 * Клиентская проверка — только удобство; источник правды здесь.
 */

export const CHANNELS = ['whatsapp', 'telegram', 'call'] as const;

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Укажите имя')
    .max(80, 'Слишком длинное имя'),

  phone: z
    .string()
    .trim()
    .min(1, 'Укажите телефон')
    .refine((v) => isValidKzPhone(v), 'Проверьте номер: нужен формат +7 7XX XXX XX XX')
    .transform((v) => normalizeKzPhone(v) as string),

  format: z.string().trim().max(120).optional().nullable(),

  date: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .refine(
      (v) => !v || !Number.isNaN(Date.parse(v)),
      'Не удалось распознать дату',
    ),

  place: z.string().trim().max(200).optional().nullable(),
  channel: z.enum(CHANNELS).optional().nullable(),
  comment: z.string().trim().max(2000).optional().nullable(),
  page: z.string().trim().max(300).optional().nullable(),

  // Согласие обязательно: без него заявка не уходит
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Нужно согласие на обработку персональных данных' }),
  }),

  // ── Антиспам ──────────────────────────────────────────────
  /** Honeypot: скрытое поле, которое человек не заполняет */
  company: z.string().max(0).optional().nullable(),
  /** Время заполнения формы в мс; меньше 3 сек — почти наверняка бот */
  elapsedMs: z.coerce.number().int().nonnegative().optional(),

  // ── Контекст ──────────────────────────────────────────────
  referrer: z.string().trim().max(500).optional().nullable(),
  timestamp: z.string().trim().max(40).optional().nullable(),
  device: z.string().trim().max(60).optional().nullable(),
  utm: z.record(z.string().max(40), z.string().max(200)).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

export const MIN_FILL_MS = 3000;

/** Проверки, которые нельзя выразить в схеме */
export function checkAntiSpam(raw: { company?: unknown; elapsedMs?: unknown }): string | null {
  if (typeof raw.company === 'string' && raw.company.trim() !== '') {
    return 'spam_honeypot';
  }
  if (typeof raw.elapsedMs === 'number' && raw.elapsedMs < MIN_FILL_MS) {
    return 'spam_too_fast';
  }
  return null;
}
