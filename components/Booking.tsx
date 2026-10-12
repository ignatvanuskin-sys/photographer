import { business } from '@/lib/business';
import { isTelegramConfigured } from '@/lib/telegram';
import { SectionHeading } from './SectionHeading';
import { BookingForm } from './BookingForm';

/**
 * Ключевой блок: заявка.
 * Если TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы — форма работает
 * в демо-режиме и открывает WhatsApp с уже заполненным текстом заявки.
 */
export function Booking() {
  const { services, contacts, terms } = business;
  const telegramEnabled = isTelegramConfigured();

  const placeOptions = [
    contacts.place ? `${contacts.place.replace(/, 1 этаж$/, '')}` : null,
    'Другое место',
  ].filter((v): v is string => Boolean(v));

  return (
    <section id="booking" className="section py-24 sm:py-32" aria-labelledby="booking-title">
      <div className="wrap grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <SectionHeading index="08" title="Узнать дату" id="booking-title" />
          <p className="mt-6 max-w-prose2 text-step-1 text-bone/70">
            Заполните заявку — уточним свободную дату, формат и стоимость. Ничего лишнего не
            спрашиваем.
          </p>

          <dl className="mt-10">
            {contacts.hours ? (
              <div className="rule-t flex flex-wrap items-baseline justify-between gap-x-6 py-3">
                <dt className="caps text-bone/45">Часы работы</dt>
                <dd className="m-0 text-step-1 text-bone/85">{contacts.hours}</dd>
              </div>
            ) : null}
            {contacts.place ? (
              <div className="rule-t flex flex-wrap items-baseline justify-between gap-x-6 py-3">
                <dt className="caps text-bone/45">Площадка</dt>
                <dd className="m-0 text-step-1 text-bone/85">{contacts.place}</dd>
              </div>
            ) : null}
            <div className="rule-t flex flex-wrap items-baseline justify-between gap-x-6 py-3">
              <dt className="caps text-bone/45">Ответ</dt>
              <dd className="m-0 text-step-1 text-bone/85">{terms.responseSla}</dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-7">
          <BookingForm
            services={services.map((s) => ({ id: s.id, title: s.title }))}
            whatsapp={contacts.whatsapp}
            phone={contacts.phone}
            responseSla={terms.responseSla}
            telegramEnabled={telegramEnabled}
            placeOptions={placeOptions.length > 0 ? placeOptions : ['Уточню позже']}
          />
        </div>
      </div>
    </section>
  );
}
