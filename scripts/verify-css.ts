/**
 * Проверка, что все использованные в разметке утилиты реально сгенерированы в CSS.
 *
 * Зачем: Tailwind не сообщает об ошибке, если класс не существует, — он просто
 * ничего не генерирует, а браузер молча игнорирует несуществующий класс.
 * Реальный баг, найденный аудитом: `bg-graphite/98` — модификатор прозрачности
 * обязан быть кратным 5 (шкала 0,5,…,95,100), поэтому у мобильного меню вообще
 * не было фона: пункты накладывались на контент страницы.
 *
 * Такие ошибки не видны ни в типах, ни в сборке, ни в консоли. Проверяем
 * сопоставлением классов из исходников с содержимым собранного CSS.
 *
 * Запуск: npm run verify:css (выполняется автоматически после next build).
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = join(__dirname, '..');
const CSS_DIR = join(ROOT, '.next', 'static', 'css');
const SOURCE_DIRS = ['app', 'components', 'lib'];

/** Утилиты вида bg-x/50, text-y/70, border-z/10 — те, где встречается модификатор прозрачности */
const UTILITY_WITH_OPACITY =
  /\b((?:bg|text|border|from|via|to|divide|ring|outline|decoration|placeholder|shadow|accent|fill|stroke|caret)-[A-Za-z0-9]+(?:-[A-Za-z0-9./[\]#]+)*?)\/(\d{1,3})\b/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      walk(full, out);
    } else if (['.ts', '.tsx'].includes(extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

function cssEscape(cls: string): string {
  // Tailwind экранирует «/» и «[» «]» в именах селекторов
  return cls.replace(/[/[\]]/g, (m) => `\\${m}`);
}

function main() {
  if (!existsSync(CSS_DIR)) {
    console.error('\n✖ Не найден собранный CSS (.next/static/css). Сначала запустите next build.\n');
    process.exit(1);
  }

  const css = readdirSync(CSS_DIR)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(CSS_DIR, f), 'utf8'))
    .join('\n');

  const files = SOURCE_DIRS.flatMap((d) => (existsSync(d) ? walk(join(ROOT, d)) : []));
  const offenders = new Map<string, Set<string>>();

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(UTILITY_WITH_OPACITY)) {
      const cls = match[0];
      // Классы внутри квадратных скобок (произвольные значения) Tailwind генерирует всегда
      if (cls.includes('[')) continue;
      // Ищем без ведущей точки: у класса может быть вариант (hover:, md:, focus:),
      // и тогда селектор выглядит как .hover\:border-bone\/50:hover — сам токен
      // всё равно присутствует в тексте CSS.
      if (!css.includes(cssEscape(cls))) {
        if (!offenders.has(cls)) offenders.set(cls, new Set());
        offenders.get(cls)!.add(file.replace(ROOT + '\\', '').replace(ROOT + '/', ''));
      }
    }
  }

  if (offenders.size === 0) {
    console.log('\n✔ CSS: все утилиты с модификатором прозрачности сгенерированы\n');
    return;
  }

  console.error('\n✖ Найдены классы, которые НЕ попали в собранный CSS.');
  console.error('  Tailwind их не сгенерировал — в браузере стиль просто отсутствует.\n');
  for (const [cls, where] of offenders) {
    console.error(`  • ${cls}`);
    for (const f of where) console.error(`      ${f}`);
  }
  console.error('\n  Частая причина: модификатор прозрачности не кратен 5 (шкала 0,5,…,95,100).');
  console.error('  Решение: взять кратное 5 или произвольное значение вида bg-graphite/[0.98].\n');
  process.exit(1);
}

main();
