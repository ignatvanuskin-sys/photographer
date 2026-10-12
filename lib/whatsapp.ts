import { normalizeKzPhone } from './phone';

/** Заявка, приходящая из формы. Совпадает с lib/lead-schema.ts */
export type LeadLike = {
  name?: string | null;
  phone?: string | null;
  format?: string | null;
  date?: string | null;
  place?: string | null;
  channel?: string | null;
  comment?: string | null;
  page?: string | null;
};

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  call: 'звонок',
};

export function channelLabel(channel?: string | null): string {
  if (!channel) return 'не указано';
  return CHANNEL_LABEL[channel] ?? channel;
}

/**
 * Текст заявки для WhatsApp.
 * В демо-режиме форма не отправляется на сервер, а открывает wa.me с этим текстом.
 * Строки без данных не попадают в сообщение, чтобы не выглядело как форма с пропусками.
 */
export function buildLeadText(lead: LeadLike): string {
  const lines: string[] = ['Здравствуйте! Пишу с сайта.'];
  const push = (label: string, value?: string | null) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  push('Имя', lead.name);
  push('Телефон', lead.phone);
  push('Формат', lead.format);
  push('Желаемая дата', lead.date);
  push('Локация', lead.place);
  push('Удобный канал связи', lead.channel ? channelLabel(lead.channel) : null);
  push('Комментарий', lead.comment);
  if (lead.page) lines.push(`Страница: ${lead.page}`);

  return lines.join('\n');
}

/**
 * Ссылка WhatsApp. Если номер не задан — возвращаем null,
 * чтобы кнопка не вела в пустоту.
 */
export function buildWaLink(phone: string | null, text: string): string | null {
  if (!phone) return null;
  const normalized = normalizeKzPhone(phone);
  if (!normalized) return null;
  const waNumber = normalized.slice(1); // wa.me принимает номер без «+»
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
}
