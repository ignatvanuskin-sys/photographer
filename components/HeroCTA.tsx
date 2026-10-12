'use client';

import { track } from '@/lib/analytics';

/**
 * Кнопки первого экрана. Вынесены в клиентский компонент ради событий аналитики.
 *
 * Главное действие названо прямо: «Записаться на съёмку». Прежнее «Узнать
 * свободную дату» не отвечало на вопрос «что я делаю» — человек не понимал,
 * записывается он или просто смотрит календарь. Вторичное действие ослаблено
 * до текстовой ссылки, чтобы главный путь читался однозначно.
 */
export function HeroCTA() {
  return (
    <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
      <a
        href="#booking"
        className="btn-primary px-7 py-4 text-sm"
        onClick={() => track('hero_cta_click', { place: 'hero' })}
      >
        Записаться на съёмку
      </a>
      <a
        href="#works"
        className="caps inline-flex min-h-[44px] items-center gap-2 text-bone/75 underline decoration-bone/25 underline-offset-[6px] transition-colors hover:text-bone"
        onClick={() => track('hero_cta_click', { place: 'hero_secondary' })}
      >
        Смотреть работы
        <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}
