import { business } from '@/lib/business';
import { Shot } from './Shot';
import { Reveal } from './Reveal';
import { VideoCardLink } from './VideoCardLink';
import { imageMeta } from '@/lib/images';

/**
 * Видео. Плеер здесь сознательно не подключается: файлов видео в открытых
 * источниках нет, а встраивать чужой плеер или выдавать постер за видео нельзя.
 * Поэтому — честный постер, пояснение и ссылка на источник.
 * Блок рендерится, только если в данных есть хотя бы одна позиция.
 */
export function VideoStrip() {
  const { video, portfolio } = business;
  if (video.items.length === 0) return null;

  return (
    <div className="mt-20">
      <div className="rule-t flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 pt-5">
        <h3 className="font-display text-step-3 leading-tight text-bone">Видео</h3>
        <span className="caps text-bone/45">{business.contacts.instagram ? 'Instagram' : ''}</span>
      </div>

      <p className="mt-6 max-w-prose2 text-step-1 text-bone/65">
        Видеоспиннер 360 и видео с событий. Полные ролики выложены в профиле — здесь только кадр-постер,
        потому что файлов видео в открытых источниках нет.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {video.items.map((item, i) => {
          // Постер берём из данных; если это кадр портфолио — размеры уже известны
          const inPortfolio = portfolio
            .flatMap((s) => s.photos)
            .find((p) => p.src === item.poster);
          const meta = item.poster ? imageMeta(item.poster) : null;
          const w = inPortfolio?.w ?? meta?.width ?? 1440;
          const h = inPortfolio?.h ?? meta?.height ?? 960;
          const alt = inPortfolio?.alt ?? item.title;

          return (
            <Reveal key={item.id} delay={i * 80}>
              <VideoCardLink href={item.href} title={item.title} id={item.id}>
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {item.poster ? (
                    <Shot
                      src={item.poster}
                      alt={alt}
                      w={w}
                      h={h}
                      sizes="(max-width: 640px) 92vw, 46vw"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <span className="scrim-b absolute inset-0" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center border border-bone/40 text-bone/90"
                    >
                      ▶
                    </span>
                    <span className="caps text-bone">{item.title}</span>
                  </span>
                </div>
                {item.note ? (
                  <p className="rule-t mt-4 pt-3 text-step-0 text-bone/55">{item.note}</p>
                ) : null}
              </VideoCardLink>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
