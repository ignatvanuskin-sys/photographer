import type { Metadata } from 'next';
import Link from 'next/link';
import { business } from '@/lib/business';
import { buildMetadata } from '@/lib/seo';
import { prettyPhone } from '@/lib/phone';

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: 'Политика конфиденциальности',
    description: `Как ${business.brand.name} обрабатывает персональные данные, оставленные в форме заявки на сайте.`,
    path: '/privacy',
    mode: business.mode,
  });
}

/**
 * Политика обработки персональных данных.
 * Ссылка на страницу стоит в чекбоксе согласия в форме заявки.
 */
export default function PrivacyPage() {
  const { brand, contacts, analytics, mode } = business;
  const operator = process.env.NEXT_PUBLIC_DATA_OPERATOR ?? brand.name;

  const collected = [
    'имя, которое вы указали в форме',
    'номер телефона',
    'выбранный формат съёмки, желаемая дата и локация',
    'комментарий, если вы его оставили',
    'технические данные о посещении: адрес страницы, источник перехода (referrer), UTM-метки, тип устройства и время отправки',
  ];

  return (
    <main className="section pb-24 pt-32 sm:pt-40">
      <div className="wrap max-w-3xl">
        <nav aria-label="Хлебные крошки" className="caps text-bone/45">
          <Link href="/" className="hover:text-bone">
            Главная
          </Link>
          <span className="px-2">/</span>
          <span className="text-bone/70">Политика конфиденциальности</span>
        </nav>

        <h1 className="rule-t mt-6 pt-6 font-display text-step-4 leading-[1.08] tracking-tight2 text-bone">
          Политика обработки персональных данных
        </h1>

        <div className="mt-8 space-y-6 text-step-1 text-bone/75">
          <section>
            <h2 className="font-display text-step-2 text-bone">1. Оператор</h2>
            <p className="mt-3">
              Персональные данные обрабатывает {operator}
              {contacts.place ? `, ${contacts.place}` : ''}
              {contacts.address ? `, ${contacts.city}, ${contacts.address}` : ''}.
              {contacts.phone ? ` Телефон для обращений: ${prettyPhone(contacts.phone)}.` : ''}
            </p>
          </section>

          <section>
            <h2 className="font-display text-step-2 text-bone">2. Какие данные собираются</h2>
            <ul className="mt-3 space-y-2">
              {collected.map((row) => (
                <li key={row} className="flex gap-3">
                  <span aria-hidden="true" className="text-brass">
                    —
                  </span>
                  {row}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-step-2 text-bone">3. Зачем они нужны</h2>
            <p className="mt-3">
              Единственная цель — ответить на вашу заявку: согласовать формат, дату, локацию и
              стоимость съёмки. Данные не используются для рассылок и не продаются третьим лицам.
            </p>
          </section>

          <section>
            <h2 className="font-display text-step-2 text-bone">4. Куда попадает заявка</h2>
            <p className="mt-3">
              Текст заявки отправляется в{' '}
              {mode === 'production'
                ? 'закрытый чат оператора в Telegram'
                : 'мессенджер WhatsApp, который вы открываете сами'}
              . Обработка данных внутри этих сервисов регулируется их собственными правилами.
            </p>
          </section>

          <section>
            <h2 className="font-display text-step-2 text-bone">5. Файлы cookie и аналитика</h2>
            <p className="mt-3">
              {analytics.ga4 || analytics.ym
                ? 'Сайт использует системы веб-аналитики (Google Analytics 4 и/или Яндекс.Метрика) для обезличенной статистики посещений. UTM-метки и источник перехода хранятся в sessionStorage браузера до закрытия вкладки.'
                : 'Системы веб-аналитики на сайте не подключены. UTM-метки и источник перехода хранятся только в sessionStorage вашего браузера и исчезают при закрытии вкладки.'}
            </p>
          </section>

          <section>
            <h2 className="font-display text-step-2 text-bone">6. Сколько данные хранятся</h2>
            <p className="mt-3">
              Переписка по заявке хранится столько, сколько нужно для работы над съёмкой и
              последующих обращений. Вы можете попросить удалить переписку и данные по номеру выше.
            </p>
          </section>

          <section>
            <h2 className="font-display text-step-2 text-bone">7. Ваши права</h2>
            <p className="mt-3">
              Вы вправе запросить доступ к своим данным, их исправление или удаление, а также
              отозвать согласие на обработку — для этого достаточно написать или позвонить по
              контактам выше.
            </p>
          </section>

          <section>
            <h2 className="font-display text-step-2 text-bone">8. Согласие</h2>
            <p className="mt-3">
              Отправляя форму, вы подтверждаете согласие на обработку перечисленных данных на
              условиях этой политики. Без отметки согласия отправка формы заблокирована.
            </p>
          </section>

          {mode !== 'production' ? (
            <section className="rule-t pt-6">
              <p className="text-step-0 text-brass/80">
                Демонстрационный концепт. Фото и видео принадлежат {brand.name}.
              </p>
            </section>
          ) : null}
        </div>

        <div className="rule-t mt-12 pt-6">
          <Link href="/" className="btn-ghost">
            На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
