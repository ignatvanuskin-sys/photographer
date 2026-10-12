import { business } from '@/lib/business';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

/**
 * Пакеты. Рендерятся ТОЛЬКО если у специалиста есть опубликованные
 * цены и состав (packages.enabled = true выставляется вручную в business.json).
 * Пока публичных цен нет — секция не выводится вовсе, а не заполняется «от …».
 */
export function Packages() {
  const { packages } = business;
  if (!packages.enabled || packages.items.length === 0) return null;

  return (
    <section id="packages" className="on-light bg-bone py-24 text-ink sm:py-32">
      <div className="section">
        <div className="wrap">
          <SectionHeading index="05" title="Пакеты" aside={`${packages.items.length} варианта`} />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.items.map((item, i) => (
              <Reveal key={item.id} delay={i * 80}>
                <div className="flex h-full flex-col border p-6" style={{ borderColor: 'var(--line-light)' }}>
                  <h3 className="font-display text-step-2 text-ink">{item.title}</h3>
                  <p className="mt-4 font-display text-step-3 text-ink">{item.price}</p>
                  {item.includes.length > 0 ? (
                    <ul className="mt-5 flex-1 space-y-2">
                      {item.includes.map((row) => (
                        <li key={row} className="flex gap-3 text-step-0 text-ink-soft">
                          <span aria-hidden="true" className="text-brass-deep">
                            —
                          </span>
                          {row}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.note ? <p className="mt-4 text-step-0 text-ink-soft">{item.note}</p> : null}
                  <a href="#booking" className="btn-ghost mt-6 self-start">
                    Выбрать
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
