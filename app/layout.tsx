import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { business } from '@/lib/business';
import { buildMetadata, getSiteUrl, localBusinessJsonLd } from '@/lib/seo';
import { Analytics } from '@/components/Analytics';
import { DemoBadge } from '@/components/DemoBadge';
import { JsonLd } from '@/components/JsonLd';
import { heroSocialImage } from '@/lib/social';

/* ── Шрифты: максимум два семейства, оба с кириллицей ───────── */
const display = Cormorant_Garamond({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['cyrillic', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0E0E0F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { seo, mode, brand, contacts } = business;

  // Картинку для соцсетей отдаёт app/opengraph-image.tsx (кадр + название),
  // поэтому вручную images здесь не задаются.
  return {
    ...buildMetadata({
      title: seo.title ?? brand.name,
      description: seo.description ?? '',
      path: '/',
      mode,
      // OG/Twitter: лучший кадр (генерируется в public/og/og.jpg) + название в og:title
      images: [heroSocialImage()],
    }),
    title: {
      default: seo.title ?? brand.name,
      template: `%s | ${brand.name}`,
    },
    applicationName: brand.name,
    authors: [{ name: brand.name }],
    ...(contacts.map2gis ? { other: { '2gis': contacts.map2gis } } : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { brand, contacts, seo, services } = business;
  const siteUrl = getSiteUrl();

  const jsonLd = localBusinessJsonLd({
    name: brand.name,
    description: seo.description ?? '',
    city: contacts.city,
    address: contacts.address,
    phone: contacts.phone,
    hours: contacts.hours,
    lat: contacts.geo.lat,
    lng: contacts.geo.lng,
    sameAs: [contacts.instagram, contacts.map2gis].filter((v): v is string => Boolean(v)),
    knowsAbout: [...services.map((s) => s.title), ...brand.roles],
    image: heroSocialImage(),
    siteUrl,
  });

  return (
    <html lang="ru" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#works"
          className="caps fixed left-4 top-4 z-[80] -translate-y-24 bg-bone px-4 py-3 text-ink transition-transform focus:translate-y-0"
        >
          Перейти к работам
        </a>

        {children}

        <DemoBadge mode={business.mode} />
        <Analytics />
        {/*
          LocalBusiness/ProfessionalService без разметки Review и AggregateRating:
          собственные отзывы не размечаем (раздел 12 ТЗ).
        */}
        <JsonLd data={jsonLd} id="ld-local-service" />
      </body>
    </html>
  );
}
