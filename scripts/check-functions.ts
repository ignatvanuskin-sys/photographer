/**
 * Регрессионные проверки чистых функций.
 *
 * Запускается перед сборкой (`npm run build` → validate → check → next build).
 * Появился после реальной ошибки: prettyPhone() срезал только «+», оставляя
 * код страны в теле номера, и владелец получал в Telegram «+7 770 065 92 30»
 * вместо реального номера. Такие ошибки незаметны в вёрстке, но ломают доверие.
 *
 * Здесь же проверяется, что список секций в business.json совпадает
 * с вычисленным из данных — это второе правило проекта (нет данных → нет секции).
 */
import { formatKzPhoneMask, isValidKzPhone, normalizeKzPhone, prettyPhone } from '../lib/phone';
import { cityIn, photoCount, ratingCount, reviewCount } from '../lib/format';
import { computeEnabledSections } from '../lib/sections';
import { business } from '../lib/business';

let failed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${label.padEnd(50)} ${JSON.stringify(actual)}${
      ok ? '' : `  ← ожидалось ${JSON.stringify(expected)}`
    }`,
  );
}

console.log('\n── Телефон (Казахстан) ──');
check('+77006592307 принимается', isValidKzPhone('+77006592307'), true);
check('8 700 659 23 07 → +7…', normalizeKzPhone('8 700 659 23 07'), '+77006592307');
check('7006592307 → +7…', normalizeKzPhone('7006592307'), '+77006592307');
check('+7 (700) 659-23-07 → +7…', normalizeKzPhone('+7 (700) 659-23-07'), '+77006592307');
check('красивая запись не съедает код страны', prettyPhone('+77006592307'), '+7 700 659 23 07');
check('+1 555 000 0000 отклоняется', isValidKzPhone('+1 555 000 0000'), false);
check('123 отклоняется', isValidKzPhone('123'), false);
check('пустая строка отклоняется', isValidKzPhone(''), false);
check('+7 100 000 00 00 (нет зоны KZ) отклоняется', isValidKzPhone('+7 100 000 00 00'), false);
check('маска из «8…» даёт +7', formatKzPhoneMask('87006592307'), '+7 700 659 23 07');
check('маска неполного ввода', formatKzPhoneMask('87006'), '+7 700 6');

console.log('\n── Склонения и падеж города ──');
check('236 → оценок', ratingCount(236), '236 оценок');
check('162 → отзыва', reviewCount(162), '162 отзыва');
check('6 → отзывов', reviewCount(6), '6 отзывов');
check('28 → кадров', photoCount(28), '28 кадров');
check('Астана → «в Астане»', cityIn('Астана'), 'Астане');
check('Караганда → Караганде', cityIn('Караганда'), 'Караганде');
check('Шымкент → Шымкенте', cityIn('Шымкент'), 'Шымкенте');
check('Алматы не склоняется', cityIn('Алматы'), 'Алматы');
check('Атырау не склоняется', cityIn('Атырау'), 'Атырау');

console.log('\n── Секции: список в данных = вычисленный ──');
const enabled = computeEnabledSections(business);
check('sections.enabled совпадает с расчётом', enabled, business.sections.enabled);
check('«Пакеты» скрыты (публичных цен нет)', enabled.includes('packages' as never), false);
check('«Галерея» включена (28 кадров)', enabled.includes('gallery' as never), true);
console.log(`     включено ${enabled.length} из 12 возможных секций`);

console.log(failed === 0 ? '\n✔ Все проверки пройдены\n' : `\n✖ Провалено: ${failed}\n`);
process.exit(failed === 0 ? 0 : 1);
