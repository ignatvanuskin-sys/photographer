import { business } from '@/lib/business';
import { Shot } from './Shot';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { cityIn } from '@/lib/format';

/**
 * О специалисте. Только подтверждённые факты: площадка, часы, роли и то,
 * что клиенты пишут в отзывах. Имена сотрудников не приписываются —
 * в публичных источниках они указаны как авторы кадров и в текстах отзывов.
 */
export function About() {
  const { brand, contacts, portfolio } = business;

  const frame =
    portfolio.find((s) => s.slug === 'behind-the-scenes')?.photos[2] ??
    portfolio.find((s) => s.slug === 'behind-the-scenes')?.photos[0] ??
    null;

  return (
    <section id="about" className="on-light bg-bone py-24 text-ink sm:py-32" aria-labelledby="about-title">
      <div className="section">
        <div className="wrap">
          <SectionHeading index="07" title="О нас" id="about-title" aside={brand.roles.join(' · ')} />

          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7">
              <Reveal>
                <p className="max-w-prose2 text-step-2 leading-[1.5] text-ink/85">
                  {brand.name} — {brand.roles.join(' и ')} в {cityIn(contacts.city)}.
                  {contacts.place ? ` Основная площадка: ${contacts.place}.` : ''}
                  {contacts.hours ? ` Работаем ${contacts.hours}.` : ''}
                </p>
              </Reveal>

              <Reveal delay={90}>
                <p className="mt-6 max-w-prose2 text-step-1 text-ink-soft">
                  В отзывах клиенты чаще всего называют фотографа Сабину и отдельно отмечают, что с
                  маленькими детьми здесь умеют работать. Рейтинг карточки в {business.reviews.source}
                  {business.reviews.rating !== null ? ` — ${business.reviews.rating}` : ''} при{' '}
                  {business.reviews.count !== null ? business.reviews.count : '—'} оценках.
                </p>
              </Reveal>

              <Reveal delay={140}>
                <p className="rule-t mt-8 pt-5 text-step-0 text-ink-soft/80">
                  Тексты отзывов приведены в разделе «Отзывы клиентов» без правок, со ссылкой на
                  карточку.
                </p>
              </Reveal>
            </div>

            {frame ? (
              <Reveal delay={180} className="md:col-span-4 md:col-start-9">
                <figure className="relative aspect-[3/4] w-full overflow-hidden">
                  <Shot
                    src={frame.src}
                    alt={frame.alt}
                    w={frame.w}
                    h={frame.h}
                    sizes="(max-width: 768px) 92vw, 32vw"
                    className="h-full w-full object-cover"
                  />
                </figure>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
