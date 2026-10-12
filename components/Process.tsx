import { business } from '@/lib/business';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { pad2 } from '@/lib/format';

/**
 * Процесс. Шаги нейтральные: сроки и цифры не выдумываются —
 * если в данных нет сроков, текст описывает порядок действий, а не обещания.
 */
export function Process() {
  const { process } = business;
  if (process.length === 0) return null;

  return (
    <section id="process" className="section py-24 sm:py-32" aria-labelledby="process-title">
      <div className="wrap">
        <SectionHeading
          index="04"
          title="Как это идёт"
          id="process-title"
          aside={`${process.length} шагов`}
        >
          Сначала обсуждаем идею и локацию, потом съёмка, потом отбор и обработка.
        </SectionHeading>

        <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {process.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={(i % 3) * 80}>
                <div className="rule-t pt-4">
                  <span className="caps num text-brass">{pad2(i + 1)}</span>
                  <h3 className="mt-3 font-display text-step-2 leading-tight text-bone">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-step-0 text-bone/65">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
