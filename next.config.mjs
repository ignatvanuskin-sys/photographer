import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */

/**
 * Режим берётся из content/business.json — это ЕДИНСТВЕННЫЙ источник правды.
 * Раньше значение читалось ещё и из переменной окружения MODE, из-за чего
 * сайт можно было перевести в production наполовину (заголовок X-Robots-Tag
 * снимался, а robots.txt и метатеги оставались демонстрационными).
 *
 * Переключение: "mode": "production" в content/business.json.
 */
function readMode() {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(here, 'content', 'business.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.mode === 'production' ? 'production' : 'demo';
  } catch {
    // Файл ещё не создан или повреждён — безопасный демо-режим.
    // Валидатор данных в этом случае всё равно остановит сборку.
    return 'demo';
  }
}

const MODE = readMode();

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
];

// В демо-режиме любой краулер получает явный запрет индексации на уровне HTTP,
// независимо от того, читает ли он <meta name="robots">.
if (MODE !== 'production') {
  securityHeaders.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' });
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 960, 1280, 1600, 1920, 2400],
    imageSizes: [96, 160, 240, 320],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Локальные оптимизированные кадры можно кэшировать агрессивно
        source: '/images/optimized/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
