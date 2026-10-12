/**
 * Даты в часовом поясе Астаны.
 *
 * Считаем «сегодня» по времени клиента (UTC+5), а не по UTC: иначе поздним
 * вечером в Астане поле даты предлагало бы уже прошедший день.
 * Вынесено отдельно, потому что используется и на клиенте (min у input),
 * и на сервере (валидация заявки).
 */

/** Сегодняшняя дата в Астане в формате YYYY-MM-DD */
export function todayInAlmaty(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Almaty',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * Дата в прошлом?
 * Сравниваем строки YYYY-MM-DD — для ISO-формата это корректно.
 * Если формат не распознан, возвращаем false: за формат отвечает отдельная проверка.
 */
export function isPastDate(value: string): boolean {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  return day < todayInAlmaty();
}
