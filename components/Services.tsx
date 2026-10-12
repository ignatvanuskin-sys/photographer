import { business } from '@/lib/business';
import { Shot } from './Shot';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { ServiceAskLink } from './ServiceAskLink';
import { pad2 } from '@/lib/format';

/**
 * Форматы съёмок. Описания и «что входит» берутся только из подтверждённых
 * источников; где данных нет — блок не выводится, а не заполняется общими словами.
 */
export function Services() {
  const { services, portfolio } = business;
  if (services.length < 2) return null;

  // Иллюстрация для формата: обложка подходящей серии, иначе — любой кадр
  const fallback = portfolio[0]?.photos[0] ?? null;
  const illustration: Record<string, typeof fallback> = {
    photo: portfolio.find((s) => s.slug === 'park-guests')?.photos[0] ?? fallback,
    'love-story': portfolio.find((s) => s.slug === 'love-story')?.photos[0] ?? fallback,
    video: portfolio.find((s) => s.slug === 'evening-park')?.photos[0] ?? fallback,
    mobilograf: portfolio.find((s) => s.slug === 'behind-the-scenes')?.photos[0] ?? fallback,
    'spinner-360': portfolio.find((s) => s.slug === 'evening-park')?.photos[0] ?? fallback,
    bodyart: portfolio.find((s) => s.slug === 'family-and-kids')?.photos[0] ?? fallback,
  };

  return (
    <section id="formats" className="section py-24 sm:py-32" aria-labelledby="formats-title">
      <div className="wrap">
        <SectionHeading
          index="03"
          title="Форматы"
          id="formats-title"
          aside={`${services.length} форматов`}
        >
          Каждый формат — отдельная строка: что снимаем и как об этом спросить.
        </SectionHeading>

        <ul className="mt-12">
          {services.map((service, i) => {
            const image = illustration[service.id];
            return (
              <li key={service.id} className="rule-t first:border-t-0">
                <Reveal>
                  <div className="grid grid-cols-1 items-start gap-6 py-8 md:grid-cols-12 md:gap-10">
                    <span className="caps num text-bone/35 md:col-span-1">{pad2(i + 1)}</span>

                    <div className="md:col-span-4">
                      <h3 className="font-display text-step-3 leading-tight text-bone">
                        {service.title}
                      </h3>
                    </div>

                    <div className="md:col-span-5">
                      {service.description ? (
                        <p className="max-w-prose2 text-step-1 text-bone/70">{service.description}</p>
                      ) : null}

                      {service.includes.length > 0 ? (
                        <ul className="mt-4 space-y-2">
                          {service.includes.map((row) => (
                            <li key={row} className="flex gap-3 text-step-0 text-bone/60">
                              <span aria-hidden="true" className="text-brass">
                                —
                              </span>
                              {row}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {service.from ? (
                        <p className="mt-4 text-step-1 text-bone">от {service.from}</p>
                      ) : null}

                      <div className="mt-5">
                        <ServiceAskLink serviceId={service.id} title={service.title} />
                      </div>
                    </div>

                    {image ? (
                      <div className="md:col-span-2">
                        <div className="relative aspect-[3/4] w-[120px] overflow-hidden">
                          <Shot
                            src={image.src}
                            alt={image.alt}
                            w={image.w}
                            h={image.h}
                            sizes="120px"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
