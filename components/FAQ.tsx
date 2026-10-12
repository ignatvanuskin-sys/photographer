import { business } from '@/lib/business';
import { SectionHeading } from './SectionHeading';
import { FAQItem } from './FAQItem';

/**
 * Частые вопросы в виде аккордеона.
 * Ответы содержат цифры только там, где они подтверждены источником.
 */
export function FAQ() {
  const { faq } = business;
  if (faq.length < 5) return null;

  return (
    <section id="faq" className="section py-24 sm:py-32" aria-labelledby="faq-title">
      <div className="wrap">
        <SectionHeading index="09" title="Частые вопросы" id="faq-title" aside={`${faq.length}`} />

        <div className="mt-12 max-w-3xl">
          {faq.map((item, i) => (
            <FAQItem key={item.q} question={item.q} answer={item.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
