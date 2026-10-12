import Link from 'next/link';
import { business } from '@/lib/business';

/**
 * Подвал. В демо-режиме обязательна строка о принадлежности материалов:
 * фотографии принадлежат специалисту, публичная индексация закрыта (раздел 2 ТЗ).
 */
export function Footer() {
  const { brand, contacts, mode, reviews, _sources } = business;
  const year = new Date().getFullYear();

  const socials = [
    contacts.instagram ? { href: contacts.instagram, label: 'Instagram' } : null,
    contacts.whatsapp ? { href: contacts.whatsapp, label: 'WhatsApp' } : null,
    contacts.telegram ? { href: contacts.telegram, label: 'Telegram' } : null,
    contacts.map2gis ? { href: contacts.map2gis, label: '2ГИС' } : null,
  ].filter((v): v is { href: string; label: string } => Boolean(v));

  const dateNote = _sources['reviews.rating']?.includes('12.10.2026')
    ? '12.10.2026'
    : new Date().toLocaleDateString('ru-RU');

  return (
    <footer className="section pb-28 pt-16 md:pb-16">
      <div className="wrap">
        <div className="rule-t grid grid-cols-1 gap-8 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="font-display text-step-2 text-bone">{brand.name}</p>
            <p className="mt-2 max-w-prose2 text-step-0 text-bone/50">
              {brand.roles.length > 0 ? `${brand.roles.join(' · ')}. ` : ''}
              {contacts.place ? `${contacts.place}, ` : ''}
              {contacts.city}.
              {reviews.rating !== null ? ` ${reviews.rating} в ${reviews.source}.` : ''}
            </p>
          </div>

          <nav aria-label="Ссылки в подвале">
            <p className="caps text-bone/40">Разделы</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/privacy" className="text-step-0 text-bone/70 hover:text-bone">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <a href="#works" className="text-step-0 text-bone/70 hover:text-bone">
                  Работы
                </a>
              </li>
              <li>
                <a href="#contacts" className="text-step-0 text-bone/70 hover:text-bone">
                  Контакты
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="caps text-bone/40">Связь</p>
            <ul className="mt-3 space-y-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-step-0 text-bone/70 hover:text-bone"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rule-t mt-10 flex flex-col gap-3 pt-6 text-step-0 text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name}. Данные карточки и отзывов приведены по состоянию на {dateNote}.
          </p>
          {mode !== 'production' ? (
            <p className="text-brass/80">
              Демонстрационный концепт. Фото и видео принадлежат {brand.name}.
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
