'use client';

import { track } from '@/lib/analytics';

/**
 * «Спросить про этот формат» — предвыбирает формат в форме заявки
 * и прокручивает к ней. Прокрутка идёт по якорю, выбор формата —
 * через custom-событие, которое слушает BookingForm.
 */
export function ServiceAskLink({ serviceId, title }: { serviceId: string; title: string }) {
  return (
    <button
      type="button"
      className="caps text-bone/70 underline decoration-bone/25 underline-offset-4 transition-colors hover:text-bone"
      onClick={() => {
        track('service_click', { service: serviceId });
        window.dispatchEvent(new CustomEvent('rzs:preselect-format', { detail: serviceId }));
        document.getElementById('booking')?.scrollIntoView({ block: 'start' });
      }}
    >
      Спросить про «{title}»
    </button>
  );
}
