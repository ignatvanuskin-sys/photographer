import { NextResponse } from 'next/server';
import { checkAntiSpam, leadSchema } from '@/lib/lead-schema';
import { isTelegramConfigured, sendLeadToTelegram } from '@/lib/telegram';

/**
 * POST /api/lead — приём заявок.
 *
 * Защита:
 *  • honeypot-поле company (должно быть пустым);
 *  • минимальное время заполнения 3 секунды;
 *  • ограничение частоты по IP (окно 10 минут);
 *  • серверная валидация телефона (KZ) и всех полей через Zod.
 *
 * Токен бота и chat id берутся ТОЛЬКО из env. Если они не заданы,
 * заявки не отправляются: клиент в этом случае работает через WhatsApp.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

/** Простейшее хранилище частоты. На одном инстансе этого достаточно. */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);

  // Не даём карте расти бесконечно
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (value.every((t) => now - t > RATE_WINDOW_MS)) hits.delete(key);
    }
  }

  return list.length > RATE_MAX;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: Request) {
  if (!isTelegramConfigured()) {
    // Демо-режим: приём заявок на сервере выключен осознанно
    return NextResponse.json(
      { ok: false, error: 'telegram_not_configured' },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const spam = checkAntiSpam(raw as { company?: unknown; elapsedMs?: unknown });
  if (spam) {
    // Отвечаем 200, чтобы бот не подбирал обход — но заявку не отправляем
    return NextResponse.json({ ok: true, skipped: spam });
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'validation_failed',
        fields: Object.fromEntries(
          parsed.error.issues.map((i) => [String(i.path[0] ?? 'form'), i.message]),
        ),
      },
      { status: 422 },
    );
  }

  const lead = parsed.data;

  const result = await sendLeadToTelegram({
    name: lead.name,
    phone: lead.phone,
    format: lead.format ?? null,
    date: lead.date ?? null,
    place: lead.place ?? null,
    channel: lead.channel ?? null,
    comment: lead.comment ?? null,
    page: lead.page ?? null,
    referrer: lead.referrer ?? null,
    timestamp: lead.timestamp ?? new Date().toISOString(),
    device: lead.device ?? null,
    utm: lead.utm ?? {},
  });

  if (!result.ok) {
    console.error('[api/lead] не удалось отправить заявку:', result.reason);
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
}
