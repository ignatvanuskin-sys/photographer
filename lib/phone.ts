/**
 * Телефоны Казахстана: нормализация, маска ввода и валидация.
 * Формат: +7 7XX XXX XX XX (мобильные), +7 6XX/7XX — зоны нумерации KZ.
 */

/** Оставляем только цифры */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Приводит любой ввод к виду +7XXXXXXXXXX.
 * Поддерживает: 87006592307, 8 (700) 659-23-07, +7 700 659 23 07, 7006592307.
 * Возвращает null, если номер не похож на казахстанский.
 */
export function normalizeKzPhone(input: string): string | null {
  let d = digitsOnly(input);

  // 8XXXXXXXXXX → 7XXXXXXXXXX (внутриказахстанский префикс)
  if (d.length === 11 && d.startsWith('8')) d = `7${d.slice(1)}`;

  // 10 цифр без кода страны: 7006592307 → 77006592307
  if (d.length === 10) d = `7${d}`;

  if (d.length !== 11) return null;
  if (!d.startsWith('7')) return null;

  // Вторая цифра: 6 (городские зоны) или 7 (мобильные)
  const zone = d[1];
  if (zone !== '6' && zone !== '7') return null;

  return `+${d}`;
}

export function isValidKzPhone(input: string): boolean {
  return normalizeKzPhone(input) !== null;
}

/** Прогрессивная маска для поля ввода: +7 700 659 23 07 */
export function formatKzPhoneMask(input: string): string {
  let d = digitsOnly(input);

  // Пользователь начинает с 8 — воспринимаем как внутриказахстанский ввод
  if (d.startsWith('8')) d = `7${d.slice(1)}`;
  // Если первая цифра не 7, считаем, что код страны не введён
  if (d && !d.startsWith('7')) d = `7${d}`;

  d = d.slice(0, 11);

  const rest = d.slice(1);
  let out = d.length > 0 ? '+7' : '';
  if (rest.length > 0) out += ` ${rest.slice(0, 3)}`;
  if (rest.length > 3) out += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) out += ` ${rest.slice(6, 8)}`;
  if (rest.length > 8) out += ` ${rest.slice(8, 10)}`;
  return out;
}

/**
 * +77006592307 → +7 700 659 23 07 (для отображения в контактах, WhatsApp и Telegram).
 *
 * slice(2) убирает «+7» целиком. Вариант slice(1) оставлял код страны в теле
 * номера и давал неверное «+7 770 065 92 30» — ошибка ловилась проверкой
 * scripts (см. README, раздел проверок).
 */
export function prettyPhone(input: string): string {
  const normalized = normalizeKzPhone(input);
  if (!normalized) return input;
  const d = normalized.slice(2);
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

/** Ссылка для звонка: tel:+77006592307 */
export function telHref(input: string): string {
  const normalized = normalizeKzPhone(input);
  return `tel:${normalized ?? digitsOnly(input)}`;
}
