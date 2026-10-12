'use client';

import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { buildLeadText, buildWaLink } from '@/lib/whatsapp';

/**
 * Липкая нижняя панель для мобильных: [WhatsApp] [Узнать дату].
 * Скрывается, когда открыта форма заявки (секция #booking в кадре)
 * и когда открыт лайтбокс или мобильное меню — они блокируют прокрутку body.
 */
export function StickyBar({
  whatsapp,
  phone,
}: {
  whatsapp: string | null;
  phone: string | null;
}) {
  const [formInView, setFormInView] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const target = document.getElementById('booking');
    let observer: IntersectionObserver | null = null;

    if (target && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) setFormInView(entry.isIntersecting);
        },
        { threshold: 0.15 },
      );
      observer.observe(target);
    }

    // Лайтбокс и мобильное меню выставляют body { overflow: hidden }
    const syncOverlay = () => setOverlayOpen(document.body.style.overflow === 'hidden');
    syncOverlay();
    const mutation = new MutationObserver(syncOverlay);
    mutation.observe(document.body, { attributes: true, attributeFilter: ['style'] });

    return () => {
      observer?.disconnect();
      mutation.disconnect();
    };
  }, []);

  if (!mounted) return null;

  const hidden = formInView || overlayOpen;
  const waHref = buildWaLink(whatsapp ?? phone, buildLeadText({}));

  return (
    <div
      className={[
        'fixed inset-x-0 bottom-0 z-40 border-t border-bone/12 bg-graphite/95 backdrop-blur-md transition-transform duration-400 ease-out md:hidden',
        hidden ? 'pointer-events-none translate-y-full' : 'translate-y-0',
      ].join(' ')}
      aria-hidden={hidden}
    >
      <div className="grid grid-cols-2 gap-2 px-3 py-3">
        {waHref ? (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            onClick={() => track('whatsapp_click', { place: 'sticky_bar' })}
          >
            WhatsApp
          </a>
        ) : null}
        <a
          href="#booking"
          className="btn-primary"
          onClick={() => track('hero_cta_click', { place: 'sticky_bar' })}
        >
          Узнать дату
        </a>
      </div>
    </div>
  );
}
