# Rzs media — сайт-портфолио (демо-концепт)

Премиальный сайт фотографа/видеографа из Астаны. Все данные — реальные, из публичной карточки
2ГИС и публичного профиля Instagram; ничего не выдумано. Подробности — в `DATA_REPORT.md`.

**Стек:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zod · `next/image` · `next/font`

---

## Быстрый старт

```bash
npm install          # зависимости
npm run optimize     # собрать AVIF/WebP 480/960/1600/2400 + content/image-manifest.json + public/og/og.jpg
npm run dev          # http://localhost:3000
```

Сборка:

```bash
npm run build        # validate → check → next build
npm run start
npm run typecheck    # tsc --noEmit
npm run validate     # проверка content/business.json по схеме и источникам
npm run check        # регрессионные проверки чистых функций
```

`npm run build` не соберётся, если данные не валидны. `npm run check` прибит к сборке
специально: он ловит ошибки, незаметные в вёрстке (например, неверная запись телефона),
и проверяет, что список секций в `business.json` совпадает с вычисленным из данных.

> `npm run optimize` нужен один раз после добавления новых исходников в `public/images/original/`.
> Он создаёт `content/image-manifest.json` — этот файл **коммитится**, потому что из него берутся
> размеры кадров, dominant color и blur-превью. Без него сборка тоже пройдёт (компонент `<Shot>`
> возьмёт размеры из `business.json`), но без blur-плейсхолдеров.

---

## Как менять данные

**Единственный источник правды — `content/business.json`.** Компоненты читают только его.
Файл валидируется Zod-схемой (`lib/types.ts`); сборка падает, если:

- файл не соответствует схеме;
- у заполненного фактического поля нет записи в `_sources`;
- `sections.enabled` расходится с тем, что вычисляется из данных;
- включены пакеты без цены и состава;
- в файле найдены заглушки (`lorem`, `TODO`, `000 ₸`).

### Частые правки

| Что | Где |
|---|---|
| Название, слоган, роли | `brand` |
| Адрес, телефон, часы, соцсети | `contacts` |
| Главный кадр (desktop / mobile) | `hero` + обязательное поле `hero.reason` |
| Форматы съёмок | `services[]` |
| Серии работ | `portfolio[]` (кадры берутся из `public/images/original/`) |
| Отзывы | `reviews.items[]` (текст — дословно) |
| Вопросы | `faq[]` |
| Правила появления секций | автоматически, `lib/sections.ts` |

**Правило проекта:** каждая цифра, цена и срок на сайте должны иметь источник в `_sources`.
Нет данных — поле `null`, а секция просто не рендерится.

### Как добавить пакеты с ценами

1. Заполните `packages.items[]` (название, `includes[]`, `price`).
2. Переключите `packages.enabled` в `true`.
3. Добавьте источники в `_sources` (`packages.<id>.price`).
4. `npm run validate` — секция «Пакеты» включится сама.

---

## Заявки: демо → Telegram

### Демо-режим (по умолчанию)

Если `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` не заданы, форма **не отправляет данные на сервер**:
кнопка открывает WhatsApp с уже заполненным текстом заявки. Ничего не ломается, дублей не возникает.

### Боевой режим

1. Создайте бота у [@BotFather](https://t.me/BotFather) → `/newbot` → получите токен.
2. Узнайте свой chat id у [@getmyid_bot](https://t.me/getmyid_bot) (для группы добавьте бота в группу).
3. Заполните `.env.local`:

```env
MODE=production
TELEGRAM_BOT_TOKEN=123456789:AAaaBBcc...
TELEGRAM_CHAT_ID=123456789
NEXT_PUBLIC_SITE_URL=https://ваш-домен.kz
```

4. Перезапустите сборку. Теперь `POST /api/lead` отправляет заявку в чат владельца
   (`lib/telegram.ts`), а форма показывает экран «Заявка принята».

**Защита формы:** honeypot-поле, минимальное время заполнения 3 секунды, лимит 5 заявок с одного IP
за 10 минут, серверная валидация телефона KZ через Zod. Без отметки согласия кнопка отправки заблокирована.

---

## Режимы: `demo` и `production`

| | `demo` (по умолчанию) | `production` |
|---|---|---|
| Индексация | `noindex, nofollow` в мета-теге | открыта |
| HTTP-заголовок | `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` | — |
| `robots.txt` | `Disallow: /` | `Allow: /`, закрыт только `/api/` |
| `sitemap.xml` | пустой | главная, `/privacy`, страницы серий |
| Плашка в углу | «Демо-концепт» | не показывается |
| Строка в футере | «Демонстрационный концепт. Фото и видео принадлежат Rzs media» | обычный копирайт |
| Заявки | WhatsApp | Telegram |

**Переключение — единственное поле `"mode"` в `content/business.json`:**
поставьте `"production"` и пересоберите проект. Это значение читают и `app/robots.ts`,
и `app/sitemap.ts`, и метаданные, и `next.config.mjs` (заголовок `X-Robots-Tag`) —
то есть «полупроизводственного» состояния, когда заголовок снят, а `robots.txt` ещё
закрыт, возникнуть не может. Значение по умолчанию — `demo`.

---

## Аналитика

Подключается только при наличии ID — иначе скрипты не грузятся вообще.

```env
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_YM_ID=12345678
```

События: `hero_cta_click`, `gallery_open`, `lightbox_next`, `service_click`, `form_start`,
`form_submit`, `whatsapp_click`, `phone_click`, `map_click`, `video_click`, `faq_open`.
UTM-метки и referrer сохраняются в `sessionStorage` и уходят вместе с заявкой.

---

## Деплой

### Vercel

```bash
npm i -g vercel
vercel            # превью-деплой
vercel --prod     # продакшн
```

В настройках проекта добавьте переменные окружения из `.env.example`.
**Для демо оставьте `MODE=demo`** — тогда деплой закрыт от индексации.

### Netlify

Соберите статикой (`next build`) либо подключите через `@netlify/plugin-nextjs`;
команда сборки — `npm run build`, каталог `.next`.

### Домен

1. Купите домен, добавьте его в панель Vercel → Domains.
2. Пропишите A/CNAME-записи у регистратора.
3. Обновите `NEXT_PUBLIC_SITE_URL` — от него зависят canonical, sitemap и Open Graph.
4. Только после согласия владельца: `"mode": "production"` в `content/business.json`.

> Если `NEXT_PUBLIC_SITE_URL` не задан, адрес берётся из `VERCEL_PROJECT_PRODUCTION_URL`
> (стабильный домен проекта). Переменную `VERCEL_URL` используем только как крайний случай:
> это адрес конкретного деплоя, он меняется на каждом релизе и ломает canonical и `og:image`.

---

## Структура

```
app/
  layout.tsx            шрифты, метаданные, LocalBusiness JSON-LD
  page.tsx              главная; секции включаются по данным
  privacy/page.tsx      политика обработки персональных данных
  work/[slug]/page.tsx  страница серии (включается при 4+ сериях по 6+ кадров)
  api/lead/route.ts     приём заявок (Telegram) + антиспам
  robots.ts sitemap.ts
components/             Header, Hero, Manifesto, FeaturedWork, Gallery, Lightbox,
                        Services, Process, Packages, Reviews, About, Booking,
                        FAQ, Contacts, StickyBar, Footer, DemoBadge, Shot, Reveal
content/business.json   единственный источник правды
content/image-manifest.json  размеры, dominant color, blur для каждого кадра
lib/                    types (Zod), business, sections, phone, whatsapp, telegram,
                        lead-schema, seo, social, analytics, format, images
scripts/                validate-business.ts, optimize-images.ts, contact-sheet.ts
public/images/original/ исходники кадров
```

---

## Изображения

- Исходники: `public/images/original/` (29 файлов 2ГИС + 26 превью Instagram).
- `npm run optimize` создаёт `public/images/optimized/` (AVIF + WebP, ширины 480/960/1600/2400)
  и `content/image-manifest.json`.
- Рендер — компонент `<Shot>` на базе `next/image`: размеры и `blurDataURL` берутся из манифеста,
  подложка — dominant color. Первый экран получает `fetchpriority="high"`, остальное — lazy.
- Hero использует арт-направленный `<picture>`: на мобильном отдельный вертикальный кадр,
  поэтому в сеть уходит только один файл (критично для LCP).
- `scripts/contact-sheet.ts` — dev-инструмент: собирает контактные листы для быстрой
  классификации новых кадров (`npx tsx scripts/contact-sheet.ts`).

---

## Известные ограничения

1. **Водяной знак 2ГИС.** Все кадры из галереи карточки несут впечатанный логотип 2GIS.
   В демо они показаны как есть, в исходных пропорциях, без обрезки и ретуши. Для боевой версии
   нужны оригиналы владельца — см. `DATA_REPORT.md`, §4.
2. **Видео не встроено.** Легальных файлов нет, поэтому стоит честный постер со ссылкой на профиль,
   а не фейковый плеер.
3. **OG-картинка статическая.** `app/opengraph-image.tsx` на `next/og` не собирается, если в пути
   проекта есть пробелы и кириллица (`@vercel/og` не разбирает собственный URL). Поэтому
   `public/og/og.jpg` (1200×630) генерируется скриптом `optimize-images.ts`; название добавляет `og:title`.
4. **Страницы серий не сгенерированы.** Условие ТЗ — минимум 4 серии по 6+ кадров; сейчас таких серий две.
   Серии открываются в лайтбоксе. Механизм `/work/[slug]` в коде есть и включится автоматически,
   когда в сериях станет больше кадров.
5. **Rate limit хранится в памяти процесса.** Для одного инстанса этого достаточно; при нескольких
   инстансах нужен внешний стор (Redis/Upstash).
