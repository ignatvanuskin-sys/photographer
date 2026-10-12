import type { Metadata } from 'next';

export type SeoInput = {
  title: string;
  description: string;
  path?: string;
  images?: string[];
  mode: 'demo' | 'production';
  siteUrl?: string;
};

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/** Демо-режим закрывает сайт от индексации на уровне метаданных. */
export function robotsFor(mode: 'demo' | 'production'): Metadata['robots'] {
  return mode === 'production'
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
      }
    : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } };
}

export function buildMetadata(input: SeoInput): Metadata {
  const siteUrl = input.siteUrl ?? getSiteUrl();
  const url = `${siteUrl}${input.path ?? '/'}`;
  const images = (input.images ?? []).map((src) =>
    src.startsWith('http') ? src : `${siteUrl}${src}`,
  );

  return {
    metadataBase: new URL(siteUrl),
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: robotsFor(input.mode),
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url,
      siteName: 'Rzs media',
      title: input.title,
      description: input.description,
      images: images.length ? images.map((u) => ({ url: u })) : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: images.length ? images : undefined,
    },
  };
}

/**
 * Schema.org JSON-LD.
 * ВАЖНО: разметка AggregateRating/Review для собственных отзывов не добавляется
 * (требование ТЗ и правила поисковиков в отношении self-serving reviews).
 */
export function localBusinessJsonLd(params: {
  name: string;
  description: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  hours?: string | null;
  lat?: number | null;
  lng?: number | null;
  sameAs: string[];
  knowsAbout: string[];
  image?: string | null;
  siteUrl: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: params.name,
    description: params.description,
    url: params.siteUrl,
    ...(params.image ? { image: params.image } : {}),
    ...(params.phone ? { telephone: params.phone } : {}),
    ...(params.hours ? { openingHours: params.hours } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(params.address ? { streetAddress: params.address } : {}),
      addressLocality: params.city,
      addressCountry: 'KZ',
    },
    ...(params.lat !== null && params.lat !== undefined && params.lng !== null && params.lng !== undefined
      ? { geo: { '@type': 'GeoCoordinates', latitude: params.lat, longitude: params.lng } }
      : {}),
    ...(params.sameAs.length ? { sameAs: params.sameAs } : {}),
    ...(params.knowsAbout.length ? { knowsAbout: params.knowsAbout } : {}),
    areaServed: { '@type': 'City', name: params.city },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(
  trail: { name: string; path: string }[],
  siteUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
