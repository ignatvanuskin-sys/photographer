'use client';

import { useId, useState } from 'react';
import { track } from '@/lib/analytics';

/**
 * Пункт аккордеона. Доступность: кнопка с aria-expanded/aria-controls,
 * панель с role="region" и aria-labelledby. Работает с клавиатуры.
 */
export function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const buttonId = `${baseId}-button`;
  const panelId = `${baseId}-panel`;

  return (
    <div className="rule-t">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start justify-between gap-6 py-5 text-left"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) track('faq_open', { question: index });
          }}
        >
          <span className="font-display text-step-2 leading-snug text-bone">{question}</span>
          <span
            aria-hidden="true"
            className="mt-1 shrink-0 text-brass transition-transform duration-300"
            style={{ transform: open ? 'rotate(45deg)' : 'none' }}
          >
            ＋
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-6 pr-10"
      >
        <p className="max-w-prose2 text-step-1 text-bone/70">{answer}</p>
      </div>
    </div>
  );
}
