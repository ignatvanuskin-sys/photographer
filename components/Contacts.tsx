import { business } from '@/lib/business';
import { SectionHeading } from './SectionHeading';
import { ContactActions } from './ContactActions';
import { prettyPhone } from '@/lib/phone';

/**
 * Контакты. Карта подключается ссылкой-кнопкой, а не тяжёлым iframe:
 * клик ведёт в 2ГИС или Google Maps по реальным координатам карточки.
 */
export function Contacts() {
  const { contacts, brand } = business;

  const rows: { label: string; value: string }[] = [];
  if (contacts.place) rows.push({ label: 'Площадка', value: contacts.place });
  if (contacts.address) rows.push({ label: 'Адрес', value: `${contacts.city}, ${contacts.address}` });
  if (contacts.hours) rows.push({ label: 'Часы работы', value: contacts.hours });
  if (contacts.phone) rows.push({ label: 'Телефон', value: prettyPhone(contacts.phone) });

  return (
    <section id="contacts" className="section py-24 sm:py-32" aria-labelledby="contacts-title">
      <div className="wrap">
        <SectionHeading index="10" title="Контакты" id="contacts-title" aside={contacts.city} />

        <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-6">
            <dl className="m-0">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="rule-t flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                >
                  <dt className="caps text-bone/45">{row.label}</dt>
                  <dd className="m-0 text-step-1 text-bone/90">{row.value}</dd>
                </div>
              ))}
            </dl>

            {brand.name ? (
              <p className="mt-6 text-step-0 text-bone/45">
                {brand.name} — {brand.roles.join(' и ')}.
              </p>
            ) : null}
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <ContactActions />
          </div>
        </div>
      </div>
    </section>
  );
}
