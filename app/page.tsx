import { business, allShots, sectionEnabled } from '@/lib/business';
import { computeEnabledSections } from '@/lib/sections';
import { photoCount } from '@/lib/format';
import { faqJsonLd } from '@/lib/seo';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Manifesto } from '@/components/Manifesto';
import { FeaturedWork } from '@/components/FeaturedWork';
import { Gallery } from '@/components/Gallery';
import { VideoStrip } from '@/components/VideoStrip';
import { Services } from '@/components/Services';
import { Process } from '@/components/Process';
import { Packages } from '@/components/Packages';
import { Reviews } from '@/components/Reviews';
import { About } from '@/components/About';
import { Booking } from '@/components/Booking';
import { FAQ } from '@/components/FAQ';
import { Contacts } from '@/components/Contacts';
import { Footer } from '@/components/Footer';
import { StickyBar } from '@/components/StickyBar';
import { SectionHeading } from '@/components/SectionHeading';
import { JsonLd } from '@/components/JsonLd';

/**
 * Главная страница.
 *
 * Порядок и наличие секций определяются данными: список enabled вычисляется
 * в lib/sections.ts, а не задаётся вручную. Секция без данных не рендерится.
 */
export default function HomePage() {
  const { brand, contacts, faq } = business;
  const enabled = computeEnabledSections(business);
  const shots = allShots();

  // Категории для фильтров галереи — в порядке появления серий
  const categories = [...new Set(shots.map((s) => s.category))];

  const nav = [
    sectionEnabled('featuredWork') || sectionEnabled('gallery')
      ? { href: '#works', label: 'Работы' }
      : null,
    sectionEnabled('services') ? { href: '#formats', label: 'Форматы' } : null,
    sectionEnabled('reviews') ? { href: '#reviews', label: 'Отзывы' } : null,
    sectionEnabled('faq') ? { href: '#faq', label: 'Вопросы' } : null,
    { href: '#contacts', label: 'Контакты' },
  ].filter((v): v is { href: string; label: string } => Boolean(v));

  return (
    <>
      <Header brandName={brand.name} nav={nav} mode={business.mode} />

      <main id="main">
        {/* Hero — всегда */}
        <Hero />

        {sectionEnabled('manifesto') ? <Manifesto /> : null}

        {sectionEnabled('featuredWork') ? <FeaturedWork /> : null}

        {sectionEnabled('gallery') ? (
          <section className="section pb-24 sm:pb-32" aria-labelledby="gallery-title">
            <div className="wrap">
              <SectionHeading
                index="02"
                title="Все работы"
                id="gallery-title"
                aside={photoCount(shots.length)}
              >
                Фильтр по форматам: выберите тот, который вам ближе.
              </SectionHeading>

              <Gallery
                shots={shots.map((s) => ({
                  src: s.src,
                  alt: s.alt,
                  w: s.w,
                  h: s.h,
                  caption: s.caption,
                  category: s.category,
                  seriesTitle: s.seriesTitle,
                }))}
                categories={categories}
                note={`Кадры из галереи карточки в ${business.reviews.source}.`}
              />

              <VideoStrip />
            </div>
          </section>
        ) : null}

        {sectionEnabled('services') ? <Services /> : null}
        {sectionEnabled('process') ? <Process /> : null}
        {sectionEnabled('packages') ? <Packages /> : null}
        {sectionEnabled('reviews') ? <Reviews /> : null}
        {sectionEnabled('about') ? <About /> : null}
        {sectionEnabled('booking') ? <Booking /> : null}
        {sectionEnabled('faq') ? <FAQ /> : null}
        {sectionEnabled('contacts') ? <Contacts /> : null}
      </main>

      <Footer />

      <StickyBar whatsapp={contacts.whatsapp} phone={contacts.phone} />

      {/*
        FAQPage-разметка — только когда блок реально отрисован.
        hreflang не добавляем: контент только на русском (раздел 2, п. 6 ТЗ).
      */}
      {enabled.includes('faq') && faq.length > 0 ? (
        <JsonLd data={faqJsonLd(faq)} id="ld-faq" />
      ) : null}
    </>
  );
}
