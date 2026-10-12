/**
 * Плашка демо-режима. Маленькая, в правом верхнем углу, но СМЕЩЕНА ВНИЗ под шапку:
 * на ширинах ~1300–1600 px вариант «top-3» перекрывал кнопку «Узнать дату» в шапке
 * (проверено в браузере). z-index ниже шапки, клики не перехватывает.
 * В MODE=production не рендерится вовсе.
 */
export function DemoBadge({ mode }: { mode: 'demo' | 'production' }) {
  if (mode === 'production') return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-3 top-[calc(var(--header-h)+12px)] z-[45] hidden sm:block"
    >
      <span className="caps rounded-full border border-brass/40 bg-graphite/85 px-3 py-1.5 text-brass backdrop-blur-sm">
        Демо-концепт
      </span>
    </div>
  );
}
