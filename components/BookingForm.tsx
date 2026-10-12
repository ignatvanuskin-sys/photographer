'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { leadSchema } from '@/lib/lead-schema';
import { formatKzPhoneMask, isValidKzPhone, prettyPhone } from '@/lib/phone';
import { todayInAlmaty } from '@/lib/dates';
import { buildLeadText, buildWaLink } from '@/lib/whatsapp';
import { captureAttribution, deviceKind, readAttribution, track } from '@/lib/analytics';
import { TEN_CHANNELS } from './booking-channels';

type Props = {
  services: { id: string; title: string }[];
  whatsapp: string | null;
  phone: string | null;
  responseSla: string;
  /** true — заявки уходят в Telegram через /api/lead; false — открывается WhatsApp */
  telegramEnabled: boolean;
  /** Варианты локации из данных */
  placeOptions: string[];
};

type Status = 'idle' | 'sending' | 'ok' | 'error';

const CHANNEL_LABELS: Record<(typeof TEN_CHANNELS)[number], string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  call: 'звонок',
};

export function BookingForm({
  services,
  whatsapp,
  phone,
  responseSla,
  telegramEnabled,
  placeOptions,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const startAt = useRef<number>(0);
  /**
   * Синхронный замок от двойной отправки.
   * Состояния React обновляются асинхронно, поэтому два быстрых клика успевали
   * оба пройти проверку `status === 'sending'` и открывали две вкладки WhatsApp.
   * Ref меняется мгновенно и закрывает эту гонку.
   */
  const submittingRef = useRef(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  const [name, setName] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [format, setFormat] = useState('');
  const [date, setDate] = useState('');
  const [place, setPlace] = useState(placeOptions[0] ?? '');
  const [channel, setChannel] = useState<(typeof TEN_CHANNELS)[number]>('whatsapp');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(''); // honeypot

  /* Минимальная дата — сегодня по времени Астаны (та же логика, что в валидации) */
  const minDate = todayInAlmaty();

  useEffect(() => {
    startAt.current = Date.now();
    captureAttribution();
  }, []);

  /* «Спросить про этот формат» → предвыбор формата в селекте */
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (services.some((s) => s.id === detail)) setFormat(detail);
    };
    window.addEventListener('rzs:preselect-format', handler);
    return () => window.removeEventListener('rzs:preselect-format', handler);
  }, [services]);

  const markStarted = useCallback(() => {
    if (started) return;
    setStarted(true);
    track('form_start', {});
  }, [started]);

  const onPhoneChange = (raw: string) => {
    setPhoneValue(formatKzPhoneMask(raw));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending' || submittingRef.current) return; // защита от двойной отправки
    submittingRef.current = true;

    setErrorText(null);
    setFieldErrors({});

    const utmEntries: Record<string, string> = {};
    for (const [k, v] of Object.entries(readAttribution().utm)) {
      if (v) utmEntries[k] = v;
    }

    const payload = {
      name: name.trim(),
      phone: phoneValue.trim(),
      format: format || null,
      date: date || null,
      place: place || null,
      channel,
      comment: comment.trim() || null,
      page: typeof window !== 'undefined' ? window.location.pathname : null,
      consent: consent as true,
      company,
      elapsedMs: Date.now() - startAt.current,
      referrer: readAttribution().referrer,
      timestamp: new Date().toISOString(),
      device: deviceKind(),
      utm: utmEntries,
    };

    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setErrorText('Проверьте выделенные поля.');
      submittingRef.current = false; // форма не ушла — можно исправить и отправить снова
      // Приводим пользователя к проблемному полю
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const el = formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`);
        el?.focus();
      }
      return;
    }

    const attribution = readAttribution();
    const leadText = buildLeadText({
      name: parsed.data.name,
      phone: prettyPhone(parsed.data.phone),
      format: services.find((s) => s.id === parsed.data.format)?.title ?? parsed.data.format,
      date: parsed.data.date,
      place: parsed.data.place,
      channel: parsed.data.channel,
      comment: parsed.data.comment,
      page: parsed.data.page,
    });

    /* ── Демо-режим: Telegram не настроен → WhatsApp ──────── */
    if (!telegramEnabled) {
      const link = buildWaLink(whatsapp ?? phone, leadText);
      if (!link) {
        setStatus('error');
        submittingRef.current = false;
        setErrorText(
          'Отправка временно недоступна: не задан номер. Позвоните нам — контакты внизу страницы.',
        );
        return;
      }
      setStatus('sending');
      track('form_submit', { transport: 'whatsapp' });
      window.open(link, '_blank', 'noopener,noreferrer');
      setStatus('ok');
      return;
    }

    /* ── Боевой режим: заявка в Telegram ──────────────────── */
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parsed.data,
          company,
          elapsedMs: payload.elapsedMs,
          referrer: attribution.referrer,
          timestamp: payload.timestamp,
          device: payload.device,
          utm: utmEntries,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus('error');
        submittingRef.current = false;
        setErrorText(
          body?.error === 'rate_limited'
            ? 'Слишком много попыток. Попробуйте через пару минут или напишите в WhatsApp.'
            : 'Не удалось отправить заявку. Напишите нам в WhatsApp — ответим быстрее.',
        );
        return;
      }

      track('form_submit', { transport: 'telegram' });
      setStatus('ok');
    } catch {
      setStatus('error');
      submittingRef.current = false;
      setErrorText('Сеть недоступна. Попробуйте ещё раз или напишите в WhatsApp.');
    }
  };

  /* ── Экран «Заявка принята» ────────────────────────────── */
  if (status === 'ok') {
    const waLink = buildWaLink(
      whatsapp ?? phone,
      buildLeadText({ name, phone: prettyPhone(phoneValue), format, date, place, channel, comment }),
    );
    return (
      <div className="rule-t pt-8" role="status" aria-live="polite">
        <p className="caps text-brass">Заявка принята</p>
        <h3 className="mt-3 font-display text-step-3 text-bone">Спасибо, {name || 'мы на связи'}.</h3>
        <p className="mt-4 max-w-prose2 text-step-1 text-bone/70">
          Ответим {responseSla}. Если удобнее написать сразу — откройте чат, текст заявки уже
          заполнен.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              onClick={() => track('whatsapp_click', { place: 'after_submit' })}
            >
              Открыть WhatsApp
            </a>
          ) : null}
          <a href="#works" className="btn-ghost">
            Вернуться к работам
          </a>
        </div>
      </div>
    );
  }

  /* ── Форма ─────────────────────────────────────────────── */
  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="rule-t pt-8"
      aria-describedby="booking-hint"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="lead-name">
            Имя
          </label>
          <input
            id="lead-name"
            name="name"
            className="field"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              markStarted();
            }}
            onFocus={markStarted}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'err-name' : undefined}
          />
          {fieldErrors.name ? (
            <p id="err-name" role="alert" className="mt-2 text-step-0 text-[#d98b7a]">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label className="label" htmlFor="lead-phone">
            Телефон
          </label>
          <input
            id="lead-phone"
            name="phone"
            className="field"
            value={phoneValue}
            onChange={(e) => {
              onPhoneChange(e.target.value);
              markStarted();
            }}
            onFocus={markStarted}
            inputMode="tel"
            type="tel"
            placeholder="+7 700 000 00 00"
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'err-phone' : undefined}
          />
          {fieldErrors.phone ? (
            <p id="err-phone" role="alert" className="mt-2 text-step-0 text-[#d98b7a]">
              {fieldErrors.phone}
            </p>
          ) : (
            phoneValue && !isValidKzPhone(phoneValue) ? (
              <p className="mt-2 text-step-0 text-bone/45">Формат: +7 7XX XXX XX XX</p>
            ) : null
          )}
        </div>

        <div>
          <label className="label" htmlFor="lead-format">
            Формат
          </label>
          <select
            id="lead-format"
            name="format"
            className="field"
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
              markStarted();
            }}
            onFocus={markStarted}
          >
            <option value="">Не знаю, помогите выбрать</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="lead-date">
            Желаемая дата
          </label>
          <input
            id="lead-date"
            name="date"
            type="date"
            className="field"
            min={minDate}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              markStarted();
            }}
            onFocus={markStarted}
          />
        </div>

        <div>
          <label className="label" htmlFor="lead-place">
            Локация
          </label>
          <select
            id="lead-place"
            name="place"
            className="field"
            value={place}
            onChange={(e) => {
              setPlace(e.target.value);
              markStarted();
            }}
            onFocus={markStarted}
          >
            {placeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="label">Как удобнее связаться</legend>
          <div className="flex flex-wrap gap-2">
            {TEN_CHANNELS.map((ch) => (
              <button
                key={ch}
                type="button"
                className="chip"
                aria-pressed={channel === ch}
                onClick={() => {
                  setChannel(ch);
                  markStarted();
                }}
              >
                {CHANNEL_LABELS[ch]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="lead-comment">
            Комментарий
          </label>
          <textarea
            id="lead-comment"
            name="comment"
            className="field min-h-[112px] resize-y"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              markStarted();
            }}
            onFocus={markStarted}
            placeholder="Идея, место, сколько человек, во сколько удобно"
          />
        </div>

        {/* Honeypot: скрыт от людей, ловит ботов */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="lead-company">Компания</label>
          <input
            id="lead-company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <div className="rule-t mt-8 flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
        <label className="flex max-w-prose2 cursor-pointer items-start gap-3 text-step-0 text-bone/70">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 h-4 w-4 shrink-0 accent-[#c9a96a]"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              markStarted();
            }}
            aria-invalid={Boolean(fieldErrors.consent)}
            aria-describedby={fieldErrors.consent ? 'err-consent' : undefined}
          />
          <span>
            Согласен на обработку персональных данных —{' '}
            <Link href="/privacy" className="underline decoration-bone/30 underline-offset-4">
              политика
            </Link>
            .
          </span>
        </label>

        <div className="sm:text-right">
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto"
            disabled={status === 'sending' || !consent}
          >
            {status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
          </button>
          <p id="booking-hint" className="mt-3 text-step-0 text-bone/45">
            Ответим {responseSla}.
          </p>
        </div>
      </div>

      {fieldErrors.consent ? (
        <p id="err-consent" role="alert" className="mt-3 text-step-0 text-[#d98b7a]">
          {fieldErrors.consent}
        </p>
      ) : null}

      {errorText ? (
        <p className="mt-4 text-step-0 text-[#d98b7a]" role="alert">
          {errorText}
        </p>
      ) : null}
    </form>
  );
}
