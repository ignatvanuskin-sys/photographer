import { channelLabel, type LeadLike } from './whatsapp';

/**
 * Отправка заявки в Telegram. Токен и chat id ТОЛЬКО из env —
 * никаких значений по умолчанию и никаких зашитых идентификаторов.
 * Если env не заданы, функция не вызывается (см. app/api/lead/route.ts).
 */

export type TelegramResult = { ok: true } | { ok: false; reason: string };

/** Экранирование под parse_mode=HTML */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export type LeadRecord = LeadLike & {
  utm?: Record<string, string>;
  referrer?: string | null;
  timestamp?: string | null;
  device?: string | null;
};

/** Человекочитаемое сообщение владельцу в Telegram */
export function formatLeadMessage(lead: LeadRecord): string {
  const rows: string[] = ['<b>Новая заявка с сайта</b>', ''];

  const line = (label: string, value?: string | null) => {
    if (value && value.trim()) rows.push(`${label}: ${esc(value.trim())}`);
  };

  line('Имя', lead.name);

  // Телефон — кликабельной ссылкой
  if (lead.phone && lead.phone.trim()) {
    const tel = lead.phone.replace(/[^\d+]/g, '');
    rows.push(`Телефон: <a href="tel:${tel}">${esc(lead.phone.trim())}</a>`);
  }

  line('Формат', lead.format);
  line('Желаемая дата', lead.date);
  line('Локация', lead.place);
  line('Канал связи', lead.channel ? channelLabel(lead.channel) : null);
  line('Комментарий', lead.comment);

  rows.push('');
  line('Страница', lead.page);
  line('Источник', lead.referrer);

  const utm = lead.utm ?? {};
  const utmPairs = Object.entries(utm).filter(([, v]) => v);
  if (utmPairs.length) {
    rows.push(`UTM: ${utmPairs.map(([k, v]) => `${esc(k)}=${esc(v)}`).join(', ')}`);
  }

  line('Устройство', lead.device);
  if (lead.timestamp) {
    const d = new Date(lead.timestamp);
    const formatted = Number.isNaN(d.getTime())
      ? lead.timestamp
      : d.toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' });
    rows.push(`Время: ${esc(formatted)} (Астана)`);
  }

  return rows.join('\n');
}

export async function sendLeadToTelegram(lead: LeadRecord): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, reason: 'telegram_not_configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLeadMessage(lead),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, reason: `telegram_http_${res.status}${body ? `: ${body.slice(0, 200)}` : ''}` };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown_error';
    return { ok: false, reason: `telegram_request_failed: ${message}` };
  } finally {
    clearTimeout(timeout);
  }
}
