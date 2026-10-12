'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Shot } from './Shot';
import type { LightboxItem } from './Lightbox';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

/** Сетка серии: кадры в своих пропорциях, клик открывает лайтбокс. */
export function SeriesGallery({ items, label }: { items: LightboxItem[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  /** Кнопка, открывшая лайтбокс: на неё вернётся фокус при закрытии */
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <div className="mt-10 gap-4 sm:columns-2 [&>*]:mb-4">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className="group block w-full break-inside-avoid overflow-hidden"
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setOpen(i);
            }}
            aria-label={`Открыть кадр: ${item.alt}`}
          >
            <Shot
              src={item.src}
              alt={item.alt}
              w={item.w}
              h={item.h}
              sizes="(max-width: 640px) 92vw, 46vw"
              className="h-auto w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {open !== null ? (
        <Lightbox
          items={items}
          index={open}
          label={label}
          returnFocusTo={triggerRef.current}
          onNavigate={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
