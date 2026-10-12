'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

type Props = {
  brandName: string;
  /** Якоря секций, которые реально отрисованы на странице */
  nav: { href: string; label: string }[];
  mode: 'demo' | 'production';
};

export function Header({ brandName, nav, mode }: Props) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Блокируем прокрутку под открытым меню
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
          solid
            ? 'border-b border-bone/10 bg-graphite/92 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="section">
          <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
            <a
              href="#top"
              className="font-display text-[1.0625rem] tracking-[0.06em] text-bone"
              aria-label={`${brandName} — к началу страницы`}
            >
              {brandName}
            </a>

            <nav aria-label="Основная навигация" className="hidden md:block">
              <ul className="flex items-center gap-8">
                {nav.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="caps text-bone/70 transition-colors duration-300 hover:text-bone"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="#booking"
                className="btn-primary hidden md:inline-flex"
                onClick={() => track('hero_cta_click', { place: 'header' })}
              >
                Узнать дату
              </a>

              <button
                type="button"
                className="caps flex h-11 w-11 items-center justify-center border md:hidden"
                style={{ borderColor: 'var(--line-dark)' }}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((v) => !v)}
              >
                <span className="sr-only">{open ? 'Закрыть меню' : 'Открыть меню'}</span>
                <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
                  <span
                    className="h-px w-full bg-bone transition-transform duration-300"
                    style={open ? { transform: 'translateY(3px) rotate(45deg)' } : undefined}
                  />
                  <span
                    className="h-px w-full bg-bone transition-transform duration-300"
                    style={open ? { transform: 'translateY(-3px) rotate(-45deg)' } : undefined}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-40 flex flex-col justify-center bg-graphite/98 pt-[var(--header-h)] md:hidden"
        >
          <nav aria-label="Навигация в мобильном меню" className="section">
            <ul className="wrap flex flex-col">
              {[...nav, { href: '#booking', label: 'Заявка' }].map((item, i) => (
                <li key={item.href} className={i === 0 ? '' : 'rule-t'}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-5 font-display text-step-3 text-bone"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
