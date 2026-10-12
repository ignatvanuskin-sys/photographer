import Link from 'next/link';
import type { Metadata } from 'next';
import { business } from '@/lib/business';
import { buildMetadata } from '@/lib/seo';

/**
 * 404 в стиле сайта.
 *
 * До этого отдавалась стандартная страница Next.js: английский текст
 * «This page could not be found», без брендинга и без пути назад,
 * а единственная ссылка вела на несуществующий якорь.
 *
 * Страница не содержит технической информации: ни стека, ни кода ошибки.
 */
export function generateMetadata(): Metadata {
  return {
    ...buildMetadata({
      title: 'Страница не найдена',
      description: 'Такой страницы на сайте нет. Вернитесь на главную или откройте работы.',
      path: '/404',
      mode: business.mode,
    }),
    robots: { index: false, follow: true },
  };
}

export default function NotFound() {
  const { brand, contacts } = business;

  return (
    <main id="main" className="section flex min-h-[100svh] flex-col justify-center py-24">
      <div className="wrap max-w-2xl">
        <p className="caps num text-brass">Ошибка 404</p>

        <h1 className="mt-5 font-display text-step-4 leading-[1.08] tracking-tight2 text-bone">
          Такой страницы нет
        </h1>

        <p className="mt-6 max-w-prose2 text-step-1 text-bone/70">
          Возможно, адрес изменился или в ссылке опечатка. Ниже — куда можно пойти дальше.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            На главную
          </Link>
          <Link href="/#works" className="btn-ghost">
            Смотреть работы
          </Link>
          <Link href="/#booking" className="btn-ghost">
            Записаться на съёмку
          </Link>
        </div>

        <div className="rule-t mt-12 pt-6">
          <p className="text-step-0 text-bone/50">
            {brand.name}
            {contacts.place ? ` · ${contacts.place}` : ''}
            {contacts.city ? ` · ${contacts.city}` : ''}
            {contacts.hours ? ` · ${contacts.hours}` : ''}
          </p>
        </div>
      </div>
    </main>
  );
}
