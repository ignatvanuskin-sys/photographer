import type { MetadataRoute } from 'next';
import { business } from '@/lib/business';
import { getSiteUrl } from '@/lib/seo';

/**
 * В демо-режиме robots.txt закрывает сайт целиком: индексация не должна
 * начаться раньше, чем владелец согласится на публикацию.
 * Дополнительно стоит X-Robots-Tag на уровне HTTP (next.config.mjs).
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (business.mode !== 'production') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: undefined,
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
