'use client';

import { business } from '@/lib/business';
import { track } from '@/lib/analytics';
import { telHref } from '@/lib/phone';

/**
 * Кнопки связи: WhatsApp, звонок, Instagram и карты.
 * Открываются только те, для которых есть подтверждённые данные —
 * битых ссылок и «заглушек» не бывает.
 */
export function ContactActions() {
  const { contacts } = business;

  return (
    <div className="flex flex-col gap-3">
      {contacts.whatsapp ? (
        <a
          href={contacts.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          onClick={() => track('whatsapp_click', { place: 'contacts' })}
        >
          Написать в WhatsApp
        </a>
      ) : null}

      {contacts.phone ? (
        <a
          href={telHref(contacts.phone)}
          className="btn-ghost"
          onClick={() => track('phone_click', { place: 'contacts' })}
        >
          Позвонить
        </a>
      ) : null}

      {contacts.instagram ? (
        <a
          href={contacts.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
        >
          Профиль в Instagram
        </a>
      ) : null}

      {contacts.telegram ? (
        <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          Telegram
        </a>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {contacts.map2gis ? (
          <a
            href={contacts.map2gis}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn-ghost"
            onClick={() => track('map_click', { map: '2gis' })}
          >
            Открыть в 2ГИС
          </a>
        ) : null}

        {contacts.mapGoogle ? (
          <a
            href={contacts.mapGoogle}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn-ghost"
            onClick={() => track('map_click', { map: 'google' })}
          >
            Открыть в Google Maps
          </a>
        ) : null}
      </div>

      {contacts.geo.lat !== null && contacts.geo.lng !== null ? (
        <p className="caps mt-1 text-bone/35">
          {contacts.geo.lat.toFixed(5)}, {contacts.geo.lng.toFixed(5)}
        </p>
      ) : null}
    </div>
  );
}
