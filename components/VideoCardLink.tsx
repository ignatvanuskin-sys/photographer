'use client';

import type { ReactNode } from 'react';
import { track } from '@/lib/analytics';

/** Постер видео: ведёт в профиль-источник, а не в фейковый плеер. */
export function VideoCardLink({
  href,
  title,
  id,
  children,
}: {
  href: string | null;
  title: string;
  id: string;
  children: ReactNode;
}) {
  if (!href) return <div className="group block">{children}</div>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      onClick={() => track('video_click', { video: id })}
      aria-label={`${title} — смотреть в источнике`}
    >
      {children}
    </a>
  );
}
