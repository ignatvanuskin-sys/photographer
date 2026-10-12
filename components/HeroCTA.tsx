'use client';

import { track } from '@/lib/analytics';

/** Кнопки первого экрана. Вынесены в клиентский компонент ради событий аналитики. */
export function HeroCTA() {
  return (
    <div className="mt-9 flex flex-wrap gap-3">
      <a
        href="#booking"
        className="btn-primary"
        onClick={() => track('hero_cta_click', { place: 'hero' })}
      >
        Узнать свободную дату
      </a>
      <a
        href="#works"
        className="btn-ghost"
        onClick={() => track('hero_cta_click', { place: 'hero_secondary' })}
      >
        Смотреть работы
      </a>
    </div>
  );
}
