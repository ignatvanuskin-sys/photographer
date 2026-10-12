import type { ReactNode } from 'react';

type Props = {
  /** Служебный номер секции: «01», «02» … */
  index?: string;
  title: string;
  /** Уточнение справа: формат, источник, диапазон */
  aside?: ReactNode;
  id?: string;
  children?: ReactNode;
};

/** Единая шапка секции: номер, заголовок, тонкая линия, необязательная сноска. */
export function SectionHeading({ index, title, aside, id, children }: Props) {
  return (
    <div className="rule-t pt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <div className="flex items-baseline gap-4 sm:gap-6">
          {index ? <span className="caps num text-brass">{index}</span> : null}
          <h2
            id={id}
            className="font-display text-step-4 leading-[1.1] tracking-tight2 text-bone"
          >
            {title}
          </h2>
        </div>
        {aside ? <div className="caps text-bone/45">{aside}</div> : null}
      </div>
      {children ? <div className="mt-6 max-w-prose2 text-step-1 text-bone/70">{children}</div> : null}
    </div>
  );
}
