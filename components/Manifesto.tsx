import { business } from '@/lib/business';
import { Shot } from './Shot';
import { Reveal } from './Reveal';

/**
 * Короткий манифест: строка из собственных слов специалиста + тонкий кадр рядом.
 * Текст берётся из данных (слоган) — ничего не досочиняется.
 */
export function Manifesto() {
  const { brand } = business;
  if (!brand.tagline) return null;

  // Тонкий вертикальный кадр для асимметрии композиции.
  const series = business.portfolio.find((s) => s.slug === 'behind-the-scenes');
  const frame = series?.photos[0] ?? business.portfolio[0]?.photos[0] ?? null;

  return (
    <section className="section py-24 sm:py-32" aria-label="О подходе">
      <div className="wrap grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-8 lg:col-span-7">
          <Reveal>
            <p className="font-display text-step-4 leading-[1.18] tracking-tight2 text-bone">
              <span className="text-brass">«</span>
              {brand.tagline}
              <span className="text-brass">»</span>
            </p>
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-8 max-w-prose2 text-step-1 text-bone/65">
              {business.contacts.place ? `${business.contacts.place}. ` : ''}
              {business.services.length > 0
                ? `Форматы: ${business.services.map((s) => s.title).join(', ')}.`
                : ''}
            </p>
          </Reveal>
        </div>

        {frame ? (
          <Reveal delay={140} className="md:col-span-4 md:col-start-9">
            <figure className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden md:ml-auto">
              <Shot
                src={frame.src}
                alt={frame.alt}
                w={frame.w}
                h={frame.h}
                sizes="(max-width: 768px) 70vw, 280px"
                className="h-full w-full object-cover"
              />
            </figure>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
