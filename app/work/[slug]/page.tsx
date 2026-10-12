import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { business } from '@/lib/business';
import { hasSeriesPages, seriesHasOwnPage } from '@/lib/sections';
import { breadcrumbJsonLd, buildMetadata, getSiteUrl } from '@/lib/seo';
import { Shot } from '@/components/Shot';
import { JsonLd } from '@/components/JsonLd';
import { SeriesGallery } from '@/components/SeriesGallery';
import { photoCount } from '@/lib/format';

/**
 * Страница серии.
 *
 * Появляется только при достаточном объёме материала: минимум 4 серии
 * по 6+ кадров (раздел 6 ТЗ). Пока условие не выполнено,
 * generateStaticParams возвращает пустой список и маршрут не генерируется —
 * серии открываются в лайтбоксе на главной.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  if (!hasSeriesPages(business)) return [];
  return business.portfolio
    .filter((series) => seriesHasOwnPage(business, series))
    .map((series) => ({ slug: series.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const series = business.portfolio.find((s) => s.slug === params.slug);
  if (!series) return buildMetadata({ title: 'Серия не найдена', description: '', mode: business.mode });

  const city = business.contacts.city;
  return buildMetadata({
    title: `${series.title} — фотограф в ${city}`,
    description: `${series.facts.format ?? series.category}: кадры из серии «${series.title}». ${
      business.brand.name
    }, ${city}.`,
    path: `/work/${series.slug}`,
    mode: business.mode,
    images: series.cover ? [series.cover] : [],
  });
}

export default function WorkPage({ params }: { params: { slug: string } }) {
  const series = business.portfolio.find((s) => s.slug === params.slug);

  if (!series || !seriesHasOwnPage(business, series)) notFound();

  const facts = [series.facts.format, series.facts.place, series.facts.season]
    .filter(Boolean)
    .join(' · ');

  return (
    <main className="section pb-24 pt-32 sm:pt-40">
      <div className="wrap">
        <nav aria-label="Хлебные крошки" className="caps text-bone/45">
          <Link href="/" className="hover:text-bone">
            Главная
          </Link>
          <span className="px-2">/</span>
          <Link href="/#works" className="hover:text-bone">
            Работы
          </Link>
          <span className="px-2">/</span>
          <span className="text-bone/70">{series.title}</span>
        </nav>

        <header className="rule-t mt-6 pt-6">
          <h1 className="font-display text-step-4 leading-[1.08] tracking-tight2 text-bone">
            {series.title}
          </h1>
          <p className="caps mt-4 text-bone/50">
            {facts}
            {series.facts.format || series.facts.place ? ' · ' : ''}
            {photoCount(series.photos.length)}
          </p>
        </header>

        <div className="mt-10">
          <Shot
            src={series.cover}
            alt={series.photos[0]?.alt ?? series.title}
            w={series.photos[0]?.w ?? 1440}
            h={series.photos[0]?.h ?? 1920}
            sizes="(max-width: 1024px) 92vw, 70vw"
            priority
            className="h-auto w-full object-cover"
          />
        </div>

        <SeriesGallery
          items={series.photos.map((p) => ({
            src: p.src,
            alt: p.alt,
            w: p.w,
            h: p.h,
            caption: p.caption,
          }))}
          label={series.title}
        />

        <div className="rule-t mt-16 flex flex-wrap items-center justify-between gap-4 pt-6">
          <Link href="/#works" className="btn-ghost">
            Все серии
          </Link>
          <Link href="/#booking" className="btn-primary">
            Узнать свободную дату
          </Link>
        </div>
      </div>

      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: 'Главная', path: '/' },
            { name: 'Работы', path: '/#works' },
            { name: series.title, path: `/work/${series.slug}` },
          ],
          getSiteUrl(),
        )}
        id="ld-breadcrumb"
      />
    </main>
  );
}
