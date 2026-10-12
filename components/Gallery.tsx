'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Shot } from './Shot';
import { track } from '@/lib/analytics';
import type { LightboxItem } from './Lightbox';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

export type GalleryShot = LightboxItem & {
  category: string;
  seriesTitle: string;
};

type Props = {
  shots: GalleryShot[];
  categories: string[];
  /** Подпись источника под галереей */
  note?: string | null;
};

/**
 * Все работы: masonry-сетка с фильтрами по форматам.
 * Пропорции кадров не приводятся к общему знаменателю — кадр показывается
 * в своих пропорциях, лица не обрезаются.
 */
export function Gallery({ shots, categories, note }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? shots : shots.filter((s) => s.category === filter)),
    [filter, shots],
  );

  if (shots.length === 0) return null;

  return (
    <>
      {/* Фильтры-чипы */}
      <div className="mt-10 -mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-1">
          <button
            type="button"
            className="chip"
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Все
            <span className="text-bone/40">{shots.length}</span>
          </button>
          {categories.map((category) => {
            const count = shots.filter((s) => s.category === category).length;
            return (
              <button
                key={category}
                type="button"
                className="chip"
                aria-pressed={filter === category}
                onClick={() => setFilter(category)}
              >
                {category}
                <span className="text-bone/40">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry: колонки сохраняют исходные пропорции кадров */}
      <div className="mt-8 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {visible.map((shot, i) => (
          <button
            key={`${shot.src}-${i}`}
            type="button"
            className="group relative block w-full break-inside-avoid overflow-hidden"
            onClick={() => {
              track('gallery_open', { category: shot.category, index: i });
              setOpen(i);
            }}
            aria-label={`Открыть кадр: ${shot.alt}`}
          >
            <Shot
              src={shot.src}
              alt={shot.alt}
              w={shot.w}
              h={shot.h}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
              className="h-auto w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
            />
            {/* Подпись появляется на указателе; на тач-устройствах не мешает */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-graphite/85 to-transparent px-3 pb-3 pt-10 text-left sm:opacity-0 sm:transition-opacity sm:duration-500 sm:group-hover:opacity-100 sm:block">
              <span className="caps block text-bone/85">{shot.seriesTitle}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="rule-t mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5">
        {note ? <p className="text-step-0 text-bone/45">{note}</p> : null}
        <a href="#booking" className="btn-ghost">
          Хотите так же? Узнайте дату
        </a>
      </div>

      {open !== null ? (
        <Lightbox
          items={visible}
          index={open}
          label={filter === 'all' ? 'Все работы' : filter}
          onNavigate={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
