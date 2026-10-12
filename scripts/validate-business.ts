/**
 * Валидация content/business.json.
 *
 * Запускается перед каждой сборкой (npm run build → npm run validate).
 * Падает с ненулевым кодом, если:
 *   1. файл не соответствует Zod-схеме;
 *   2. сохранённый sections.enabled расходится с вычисленным из данных;
 *   3. у фактического поля нет записи в _sources;
 *   4. включены пакеты без цен/состава;
 *   5. в файле есть выдуманные/заглушечные значения (lorem, TODO, 000).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { businessSchema, type Business } from '../lib/types';
import { computeEnabledSections } from '../lib/sections';

const ROOT = resolve(__dirname, '..');
const BUSINESS_PATH = resolve(ROOT, 'content/business.json');

const errors: string[] = [];
const warnings: string[] = [];

function fail(msg: string) {
  errors.push(msg);
}

function warn(msg: string) {
  warnings.push(msg);
}

function load(): unknown {
  try {
    return JSON.parse(readFileSync(BUSINESS_PATH, 'utf8'));
  } catch (e) {
    console.error(`\n✖ Не удалось прочитать ${BUSINESS_PATH}`);
    console.error(`  ${(e as Error).message}\n`);
    process.exit(1);
  }
}

const raw = load();
const parsed = businessSchema.safeParse(raw);

if (!parsed.success) {
  console.error('\n✖ content/business.json не соответствует схеме:\n');
  for (const issue of parsed.error.issues) {
    console.error(`  • ${issue.path.join('.') || '(корень)'} — ${issue.message}`);
  }
  console.error('');
  process.exit(1);
}

const b: Business = parsed.data;

/* ── 1. Секции ─────────────────────────────────────────────── */
const expected = computeEnabledSections(b);
const actual = b.sections.enabled;
const missing = expected.filter((s) => !actual.includes(s));
const extra = actual.filter((s) => !expected.includes(s));

if (missing.length) {
  fail(`sections.enabled: не хватает секций, которые должны быть включены — ${missing.join(', ')}`);
}
if (extra.length) {
  fail(`sections.enabled: включены секции без достаточных данных — ${extra.join(', ')}`);
}

/* ── 2. Источники фактических полей ────────────────────────── */
const src = b._sources;
const shots = b.portfolio.reduce((n, s) => n + s.photos.length, 0);

/** Поле считается «фактическим», если оно заполнено. */
const claim = (path: string, value: unknown) => {
  const isEmpty =
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'string' && value.trim() === '');
  if (!isEmpty && !src[path]) {
    fail(`_sources: нет источника для «${path}» (значение заполнено, но не подтверждено)`);
  }
};

claim('brand.name', b.brand.name);
claim('brand.tagline', b.brand.tagline);
claim('brand.roles', b.brand.roles);
claim('contacts.address', b.contacts.address);
claim('contacts.place', b.contacts.place);
claim('contacts.phone', b.contacts.phone);
claim('contacts.whatsapp', b.contacts.whatsapp);
claim('contacts.instagram', b.contacts.instagram);
claim('contacts.telegram', b.contacts.telegram);
claim('contacts.taplink', b.contacts.taplink);
claim('contacts.hours', b.contacts.hours);
claim('contacts.geo', b.contacts.geo.lat ?? b.contacts.geo.lng);
claim('hero', b.hero.reason);
claim('hero.desktop', b.hero.desktop.src);
claim('hero.mobile', b.hero.mobile.src);
claim('reviews.rating', b.reviews.rating);
claim('reviews.count', b.reviews.count);
claim('reviews.reviewsCount', b.reviews.reviewsCount);
claim('services', b.services);
claim('portfolio', b.portfolio.length ? shots : 0);
claim('process', b.process);
claim('faq', b.faq);
claim('terms.prepayment', b.terms.prepayment);
claim('terms.delivery', b.terms.delivery);
claim('terms.retouching', b.terms.retouching);

b.services.forEach((s) => {
  claim(`services.${s.id}.title`, s.title);
  claim(`services.${s.id}.description`, s.description);
  claim(`services.${s.id}.includes`, s.includes);
  claim(`services.${s.id}.from`, s.from);
});

b.reviews.items.forEach((r, i) => claim(`reviews.items.${i}.text`, r.text));

/* ── 3. Пакеты ─────────────────────────────────────────────── */
if (b.packages.enabled) {
  if (b.packages.items.length === 0) {
    fail('packages.enabled = true, но items пуст — включить пакеты можно только с составом и ценой');
  }
  b.packages.items.forEach((p) => {
    if (!p.price?.trim()) fail(`packages.${p.id}: не указана цена при packages.enabled = true`);
    if (p.includes.length === 0) fail(`packages.${p.id}: не указан состав при packages.enabled = true`);
    claim(`packages.${p.id}.price`, p.price);
  });
} else if (b.packages.items.length > 0) {
  warn('packages.enabled = false, но items заполнены — они не будут показаны');
}

/* ── 4. Запрещённые заглушки ───────────────────────────────── */
const FORBIDDEN = /\b(lorem|ipsum|TODO|FIXME|XXX|заглушка|placeholder|пример цены|000\s*₸)\b/i;
const flat = JSON.stringify(b);
if (FORBIDDEN.test(flat)) {
  const hit = flat.match(FORBIDDEN)?.[0];
  fail(`в business.json найдена заглушка «${hit}» — выдуманные значения запрещены`);
}

/* ── 5. Здравый смысл данных ───────────────────────────────── */
if (b.portfolio.length > 0 && shots < 12) {
  warn(`в портфолио ${shots} кадров — секция Gallery не появится (нужно >= 12)`);
}
if (b.reviews.items.length > 0 && b.reviews.items.length < 3) {
  warn(`отзывов ${b.reviews.items.length} — блок «Отзывы» не появится (нужно >= 3)`);
}
if (b.faq.length > 0 && b.faq.length < 5) {
  warn(`вопросов ${b.faq.length} — блок FAQ не появится (нужно >= 5)`);
}
if (b.contacts.phone && !/^\+?[0-9\s\-()]+$/.test(b.contacts.phone)) {
  fail(`contacts.phone содержит недопустимые символы: «${b.contacts.phone}»`);
}
if (b.contacts.geo.lat !== null && (b.contacts.geo.lat < -90 || b.contacts.geo.lat > 90)) {
  fail(`contacts.geo.lat вне диапазона: ${b.contacts.geo.lat}`);
}

/* ── Итог ──────────────────────────────────────────────────── */
const uniqueSlugs = new Set(b.portfolio.map((p) => p.slug));
if (uniqueSlugs.size !== b.portfolio.length) {
  fail('portfolio: slug серий должны быть уникальны');
}

if (warnings.length) {
  console.warn('\n⚠ Предупреждения:');
  warnings.forEach((w) => console.warn(`  • ${w}`));
}

if (errors.length) {
  console.error('\n✖ business.json не прошёл валидацию:\n');
  errors.forEach((e) => console.error(`  • ${e}`));
  console.error('');
  process.exit(1);
}

console.log('\n✔ business.json валиден');
console.log(`  бренд:    ${b.brand.name}`);
console.log(`  режим:    ${b.mode}`);
console.log(`  кадров:   ${shots} в ${b.portfolio.length} сериях`);
console.log(`  форматов: ${b.services.length}`);
console.log(`  отзывов:  ${b.reviews.items.length} (из ${b.reviews.reviewsCount ?? '—'})`);
console.log(`  секции:   ${b.sections.enabled.join(', ')}`);
console.log(`  источников: ${Object.keys(b._sources).length}\n`);
