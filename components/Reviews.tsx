import { business } from '@/lib/business';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { rating as fmtRating, ratingCount, reviewCount } from '@/lib/format';

/**
 * Отзывы. Тексты выводятся дословно, с автором и датой; источник — карточка 2ГИС.
 * Разметка Review/AggregateRating для собственных отзывов не добавляется.
 * Отбор цитат для демо зафиксирован в DATA_REPORT.md (раздел 3).
 */
export function Reviews() {
  const { reviews } = business;
  if (reviews.items.length < 3) return null;

  const badge: string[] = [];
  if (reviews.rating !== null) badge.push(`★ ${fmtRating(reviews.rating)}`);
  if (reviews.count !== null) badge.push(ratingCount(reviews.count));
  if (reviews.reviewsCount !== null) badge.push(reviewCount(reviews.reviewsCount));

  return (
    <section id="reviews" className="section py-24 sm:py-32" aria-labelledby="reviews-title">
      <div className="wrap">
        <SectionHeading
          index="06"
          title="Отзывы клиентов"
          id="reviews-title"
          aside={
            badge.length > 0 ? (
              <a
                href={reviews.items[0]?.sourceUrl ?? business.contacts.map2gis ?? '#'}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline decoration-bone/25 underline-offset-4 transition-colors hover:text-bone"
              >
                {badge.join(' · ')} в {reviews.source}
              </a>
            ) : null
          }
        />

        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.items.map((review, i) => (
            <li key={`${review.author}-${i}`}>
              <Reveal delay={(i % 3) * 80}>
                <blockquote className="rule-t flex h-full flex-col pt-5">
                  <p className="whitespace-pre-line text-step-1 text-bone/85">{review.text}</p>
                  <footer className="caps mt-5 text-bone/45">
                    <cite className="not-italic">{review.author}</cite>
                    {review.date ? <span className="text-bone/30"> · {review.date}</span> : null}
                    <span className="text-bone/30"> · {reviews.source}</span>
                  </footer>
                </blockquote>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
