import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';
import { getSiteUrl } from '@/lib/seo';
import { hasSeriesPages, seriesHasOwnPage } from '@/lib/sections';

/**
 * В демо-режиме карта сайта пустая — вместе с robots.txt это гарантирует,
 * что демо-концепт не попадёт в индекс. В production перечисляются
 * главная, политика и страницы серий (если они сгенерированы).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (business.mode !== 'production') return [];

  const siteUrl = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  if (hasSeriesPages(business)) {
    for (const series of business.portfolio) {
      if (!seriesHasOwnPage(business, series)) continue;
      entries.push({
        url: `${siteUrl}/work/${series.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
