'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Shot } from './Shot';
import { track } from '@/lib/analytics';
import type { LightboxItem } from './Lightbox';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

type Props = {
  slug: string;
  title: string;
  alt: string;
  cover: string;
  w: number;
  h: number;
  photos: LightboxItem[];
  index: string;
  facts: string | null;
  ratioClass: string;
  /** true — у серии есть отдельная страница, иначе открывается лайтбокс */
  hasOwnPage: boolean;
};

/** Карточка серии: либо ссылка на страницу серии, либо открытие лайтбокса. */
export function SeriesCardLink({
  slug,
  title,
  alt,
  cover,
  w,
  h,
  photos,
  index,
  facts,
  ratioClass,
  hasOwnPage,
}: Props) {
  const [open, setOpen] = useState<number | null>(null);

  const inner = (
    <>
      <div className={`relative w-full overflow-hidden ${ratioClass}`}>
        <Shot
          src={cover}
          alt={alt}
          w={w}
          h={h}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
        />
      </div>

      <div className="rule-t mt-4 flex items-baseline justify-between gap-4 pt-3">
        <div className="min-w-0">
          <p className="caps num text-brass">{index}</p>
          <h3 className="mt-1 font-display text-step-2 leading-tight text-bone">{title}</h3>
        </div>
        <span className="caps shrink-0 text-bone/40">{photos.length}</span>
      </div>
      {facts ? <p className="caps mt-2 text-bone/45">{facts}</p> : null}
    </>
  );

  if (hasOwnPage) {
    return (
      <Link
        href={`/work/${slug}`}
        className="group block"
        onClick={() => track('gallery_open', { series: slug })}
      >
        {inner}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className="group block w-full text-left"
        onClick={() => {
          track('gallery_open', { series: slug });
          setOpen(0);
        }}
        aria-label={`Открыть серию «${title}»`}
      >
        {inner}
      </button>

      {open !== null ? (
        <Lightbox
          items={photos}
          index={open}
          label={title}
          onNavigate={setOpen}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
