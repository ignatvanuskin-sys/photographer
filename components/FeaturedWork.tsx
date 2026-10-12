import { business } from '@/lib/business';
import { Shot } from './Shot';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { pad2, photoCount, seriesCount, reviewCount } from '@/lib/format';
import { SeriesCardLink } from './SeriesCardLink';
import { seriesHasOwnPage } from '@/lib/sections';

/**
 * Избранные серии: крупные карточки с чередованием пропорций 3:4 и 4:5.
 * Клик открывает лайтбокс серии (отдельные страницы серий появляются,
 * только когда в сериях достаточно кадров — см. lib/sections.ts).
 */
export function FeaturedWork() {
  const { portfolio } = business;
  if (portfolio.length === 0) return null;

  const shots = portfolio.reduce((n, s) => n + s.photos.length, 0);

  return (
    <section id="works" className="section py-24 sm:py-32" aria-labelledby="works-title">
      <div className="wrap">
        <SectionHeading
          index="01"
          title="Работы"
          id="works-title"
          aside={`${seriesCount(portfolio.length)} · ${photoCount(shots)}`}
        >
          Кадры собраны в серии по формату — так сразу видно, что подойдёт вам.
        </SectionHeading>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((series, i) => {
            // Чередуем пропорции карточек, чтобы ряд не выглядел сеткой
            const ratio = i % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]';
            const facts = [series.facts.format, series.facts.place, series.facts.season]
              .filter(Boolean)
              .join(' · ');

            return (
              <Reveal key={series.slug} delay={(i % 3) * 80}>
                <SeriesCardLink
                  slug={series.slug}
                  cover={series.cover}
                  title={series.title}
                  alt={series.photos[0]?.alt ?? series.title}
                  w={series.photos[0]?.w ?? 1440}
                  h={series.photos[0]?.h ?? 1920}
                  photos={series.photos.map((p) => ({
                    src: p.src,
                    alt: p.alt,
                    w: p.w,
                    h: p.h,
                    caption: p.caption,
                  }))}
                  hasOwnPage={seriesHasOwnPage(business, series)}
                  index={pad2(i + 1)}
                  facts={facts || null}
                  ratioClass={ratio}
                />
              </Reveal>
            );
          })}
        </div>

        {business.reviews.reviewsCount ? (
          <p className="rule-t mt-16 pt-5 text-step-0 text-bone/50">
            {reviewCount(business.reviews.reviewsCount)} с оценками в {business.reviews.source} —
            ссылка на карточку в разделе «Отзывы».
          </p>
        ) : null}
      </div>
    </section>
  );
}
