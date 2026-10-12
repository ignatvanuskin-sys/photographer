'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { imageMeta } from '@/lib/images';
import { track } from '@/lib/analytics';

export type LightboxItem = {
  src: string;
  alt: string;
  w: number;
  h: number;
  caption?: string | null;
};

type Props = {
  items: LightboxItem[];
  index: number;
  label?: string;
  /**
   * Элемент, который открыл лайтбокс. Фокус вернётся именно на него.
   * Раньше опирались на document.activeElement — но при программном клике
   * (и в части браузеров) кнопка фокус не получает, и фокус уезжал на <body>,
   * из-за чего клавиатурный пользователь терял место на странице.
   */
  returnFocusTo?: HTMLElement | null;
  onNavigate: (nextIndex: number) => void;
  onClose: () => void;
};

/**
 * Лайтбокс: свайп, стрелки, Esc, закрытие тапом по фону, подпись и счётчик.
 * Возврат фокуса на элемент, который открыл лайтбокс, — обязателен.
 * Компонент подключается динамическим импортом (см. Gallery / SeriesCardLink).
 */
export default function Lightbox({
  items,
  index,
  label,
  returnFocusTo,
  onNavigate,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  const total = items.length;
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0 || next >= total) return;
      track('lightbox_next', { direction: delta > 0 ? 'next' : 'prev' });
      onNavigate(next);
    },
    [index, total, onNavigate],
  );

  /* Фокус: запоминаем, куда вернуть, и уводим его в диалог */
  useEffect(() => {
    restoreRef.current = returnFocusTo ?? (document.activeElement as HTMLElement | null);
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, []);

  /* Клавиатура + удержание фокуса внутри диалога */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'Tab') {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  /* Предзагрузка соседних кадров */
  useEffect(() => {
    for (const neighbor of [index - 1, index + 1]) {
      const target = items[neighbor];
      if (!target) continue;
      const meta = imageMeta(target.src);
      const url = meta?.variants[meta.variants.length - 1]?.webp ?? target.src;
      const img = new window.Image();
      img.src = url;
    }
  }, [index, items]);

  /* Свайп */
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? 1 : -1);
  };

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label ? `Просмотр: ${label}` : 'Просмотр кадра'}
      className="fixed inset-0 z-[70] flex flex-col bg-graphite/98"
      style={{ animation: 'none' }}
    >
      {/* Верхняя панель */}
      <div className="rule-b flex items-center justify-between px-4 py-3 sm:px-8">
        <span className="caps num text-bone/60">
          {index + 1} / {total}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="caps flex h-11 items-center gap-2 px-3 text-bone/75 transition-colors hover:text-bone"
        >
          Закрыть
          <span aria-hidden="true" className="text-base leading-none">
            ✕
          </span>
        </button>
      </div>

      {/* Кадр */}
      <div
        ref={dialogRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 py-4 sm:px-6"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <Image
          key={item.src}
          src={item.src}
          alt={item.alt}
          width={item.w}
          height={item.h}
          sizes="(max-width: 768px) 94vw, 82vw"
          quality={88}
          // Первый кадр уже в кэше, остальные появляются по мере перехода
          priority={!loaded[index]}
          onLoad={() => setLoaded((prev) => ({ ...prev, [index]: true }))}
          placeholder={imageMeta(item.src)?.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={imageMeta(item.src)?.blurDataURL}
          className="h-auto max-h-[76svh] w-auto max-w-[94vw] object-contain sm:max-h-[80svh] sm:max-w-[86vw]"
        />

        {/* Стрелки (только указатель) */}
        <button
          type="button"
          aria-label="Предыдущий кадр"
          disabled={!hasPrev}
          onClick={() => go(-1)}
          className="absolute left-1 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-bone/20 text-bone/80 transition-colors hover:border-bone/50 hover:text-bone disabled:opacity-25 sm:flex"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          aria-label="Следующий кадр"
          disabled={!hasNext}
          onClick={() => go(1)}
          className="absolute right-1 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-bone/20 text-bone/80 transition-colors hover:border-bone/50 hover:text-bone disabled:opacity-25 sm:flex"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* Нижняя панель: подпись и мобильные кнопки */}
      <div className="rule-t flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <div className="min-w-0">
          {label ? <p className="caps truncate text-bone/45">{label}</p> : null}
          <p className="truncate text-step-0 text-bone/75">{item.caption ?? item.alt}</p>
        </div>

        <div className="flex shrink-0 gap-2 sm:hidden">
          <button
            type="button"
            aria-label="Предыдущий кадр"
            disabled={!hasPrev}
            onClick={() => go(-1)}
            className="flex h-11 w-11 items-center justify-center border border-bone/20 text-bone/80 disabled:opacity-25"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Следующий кадр"
            disabled={!hasNext}
            onClick={() => go(1)}
            className="flex h-11 w-11 items-center justify-center border border-bone/20 text-bone/80 disabled:opacity-25"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
