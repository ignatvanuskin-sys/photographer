/** Форматирование под локаль Астаны: русские склонения, ₸, часы работы. */

/** Русские склонения: plural(236, 'оценка', 'оценки', 'оценок') → 'оценок' */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function reviewCount(n: number): string {
  return `${n} ${plural(n, 'отзыв', 'отзыва', 'отзывов')}`;
}

export function ratingCount(n: number): string {
  return `${n} ${plural(n, 'оценка', 'оценки', 'оценок')}`;
}

export function photoCount(n: number): string {
  return `${n} ${plural(n, 'кадр', 'кадра', 'кадров')}`;
}

export function seriesCount(n: number): string {
  return `${n} ${plural(n, 'серия', 'серии', 'серий')}`;
}

/** Цена в тенге: 25000 → «25 000 ₸». Разделитель — неразрывный пробел. */
export function tenge(value: number): string {
  return `${value.toLocaleString('ru-RU').replace(/\u00A0/g, '\u202F')} ₸`;
}

/** Рейтинг: 4.9 → «4.9» (всегда одна цифра после точки) */
export function rating(value: number): string {
  return value.toFixed(1);
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Форма названия города для оборота «в …» (предложный падеж).
 *
 * Нужна, чтобы в заголовках не появлялось «в Астана». Правила покрывают
 * казахстанские топонимы: Астана → Астане, Караганда → Караганде,
 * Шымкент → Шымкенте, Алматы/Атырау/Актобе → без изменений.
 * Если правило не срабатывает, возвращается исходное название —
 * лучше нейтральная форма, чем придуманная.
 */
export function cityIn(city: string): string {
  const name = city.trim();
  if (!name) return name;

  const last = name.slice(-1).toLowerCase();
  const last2 = name.slice(-2).toLowerCase();

  // Несклоняемые окончания: Алматы, Атырау, Актобе, Сочи, Тбилиси
  if (['и', 'ы', 'у', 'о', 'е', 'э', 'ю'].includes(last)) return name;

  // -ия → -ии (Алма-Ата не сюда, но общее правило корректно)
  if (last2 === 'ия' || last2 === 'ея') return `${name.slice(0, -1)}и`;

  // -а / -я → -е
  if (last === 'а' || last === 'я') return `${name.slice(0, -1)}е`;

  // -ь → -и
  if (last === 'ь') return `${name.slice(0, -1)}и`;

  // Согласная → +е (Шымкент → Шымкенте, Талдыкорган → Талдыкоргане)
  return `${name}е`;
}
