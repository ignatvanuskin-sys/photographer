/**
 * Аналитика подключается только при наличии ID в env.
 * События описаны в ТЗ (раздел 13). UTM и referrer хранятся в sessionStorage
 * и уходят вместе с заявкой.
 */

export type AnalyticsEvent =
  | 'hero_cta_click'
  | 'gallery_open'
  | 'lightbox_next'
  | 'service_click'
  | 'form_start'
  | 'form_submit'
  | 'whatsapp_click'
  | 'phone_click'
  | 'map_click'
  | 'video_click'
  | 'faq_open';

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    ym?: (id: number, action: string, payload?: unknown, params?: unknown) => void;
  }
}

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) if (v !== undefined) clean[k] = v;

  window.gtag?.('event', event, clean);

  const ymId = process.env.NEXT_PUBLIC_YM_ID;
  if (ymId) {
    window.ym?.(Number(ymId), 'reachGoal', event, clean);
  }
}

/* ── UTM / referrer ─────────────────────────────────────────── */

const UTM_KEY = 'rzs:attr';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

export type Attribution = {
  utm: Record<string, string>;
  referrer: string | null;
};

/** Запоминает UTM из адресной строки при первом заходе. */
export function captureAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.sessionStorage.getItem(UTM_KEY);
    if (stored) return JSON.parse(stored) as Attribution;

    const sp = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = sp.get(key);
      if (value) utm[key] = value;
    }

    const data: Attribution = {
      utm,
      referrer: document.referrer || null,
    };

    if (Object.keys(utm).length > 0 || data.referrer) {
      window.sessionStorage.setItem(UTM_KEY, JSON.stringify(data));
    }
    return data;
  } catch {
    return null;
  }
}

export function readAttribution(): Attribution {
  if (typeof window === 'undefined') return { utm: {}, referrer: null };
  try {
    const stored = window.sessionStorage.getItem(UTM_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    /* игнорируем */
  }
  return { utm: {}, referrer: document.referrer || null };
}

export function deviceKind(): string {
  if (typeof window === 'undefined') return 'unknown';
  const w = window.innerWidth;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && w < 768) {
    return `mobile:${w}`;
  }
  if (w < 768) return `mobile:${w}`;
  if (w < 1200) return `tablet:${w}`;
  return `desktop:${w}`;
}

export const hasGa = Boolean(process.env.NEXT_PUBLIC_GA4_ID);
export const hasYm = Boolean(process.env.NEXT_PUBLIC_YM_ID);
export const gaId = process.env.NEXT_PUBLIC_GA4_ID ?? null;
export const ymId = process.env.NEXT_PUBLIC_YM_ID ?? null;
