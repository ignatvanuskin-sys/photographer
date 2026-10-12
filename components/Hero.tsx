import { business } from '@/lib/business';
import { imageMeta } from '@/lib/images';
import { cityIn, rating as fmtRating, ratingCount } from '@/lib/format';
import { HeroCTA } from './HeroCTA';

/**
 * Hero на 100svh.
 *
 * Кадры арт-направленные: на мобильном показывается вертикальный вариант,
 * на десктопе горизонтальный — через <picture><source media>, чтобы в сеть
 * уходил только один файл (это критично для LCP).
 * Предзагрузка AVIF/WebP из content/image-manifest.json (лестница 480/960/1440).
 */
function buildSrcset(src: string) {
  const meta = imageMeta(src);
  if (!meta) return null;
  return {
    avif: meta.variants.map((v) => `${v.avif} ${v.width}w`).join(', '),
    webp: meta.variants.map((v) => `${v.webp} ${v.width}w`).join(', '),
    fallback: meta.variants[meta.variants.length - 1]?.webp ?? src,
  };
}

export function Hero() {
  const { hero, brand, contacts, reviews, terms } = business;
  const desktop = buildSrcset(hero.desktop.src);
  const mobile = buildSrcset(hero.mobile.src);

  const trust = (() => {
    const parts: string[] = [];
    if (reviews.rating !== null) parts.push(`★ ${fmtRating(reviews.rating)}`);
    if (reviews.count !== null) parts.push(ratingCount(reviews.count));
    if (parts.length === 0) return null;
    return `${parts.join(' · ')} в ${reviews.source}`;
  })();

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* ── Фон ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        <picture>
          {mobile ? (
            <source
              media="(max-width: 767px)"
              type="image/avif"
              srcSet={mobile.avif}
              sizes="100vw"
            />
          ) : null}
          {mobile ? (
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet={mobile.webp}
              sizes="100vw"
            />
          ) : null}
          {desktop ? (
            <source type="image/avif" srcSet={desktop.avif} sizes="100vw" />
          ) : null}
          {desktop ? <source type="image/webp" srcSet={desktop.webp} sizes="100vw" /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktop?.fallback ?? hero.desktop.src}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
            className="kenburns h-full w-full object-cover"
            style={{ objectPosition: '50% 45%' }}
          />
        </picture>

        {/* Лёгкий градиент только под текстом — кадр не затемняется целиком */}
        <div className="scrim-b absolute inset-0" aria-hidden="true" />
        <div className="scrim-t absolute inset-x-0 top-0 h-40" aria-hidden="true" />
      </div>

      {/* ── Содержание ──────────────────────────────────────── */}
      <div className="section pb-14 pt-32 sm:pb-20">
        <div className="wrap">
          <div className="max-w-3xl">
            <p className="caps mb-5 text-brass">
              {brand.roles.length > 0 ? brand.roles.join(' · ') : 'Фото и видео'}
            </p>

            <h1
              id="hero-title"
              className="font-display text-step-6 leading-[1.02] tracking-tight2 text-bone"
            >
              Love story и фотосъёмка{' '}
              <span className="block text-bone/85">в {cityIn(contacts.city)}</span>
            </h1>

            <p className="lede mt-6 max-w-xl">
              {contacts.place ? `${contacts.place}. ` : ''}
              {contacts.hours ? `Работаем ${contacts.hours}.` : 'Фото и видео на выезде.'}
            </p>

            <HeroCTA />

            {/* Пояснение к главному действию: что именно произойдёт после нажатия */}
            <p className="mt-4 text-step-0 text-bone/60">
              Ответим {terms.responseSla}: назовём стоимость и свободную дату. Заявка ни к чему не
              обязывает.
            </p>
          </div>

          {trust ? (
            <div className="rule-t mt-12 flex flex-wrap items-center gap-x-5 gap-y-3 pt-5">
              <span className="caps text-bone/70">{trust}</span>
              {contacts.map2gis ? (
                <a
                  href={contacts.map2gis}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="caps text-bone/50 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-bone"
                >
                  Открыть карточку
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
