import Image from 'next/image';
import { imageMeta } from '@/lib/images';

type ShotProps = {
  src: string;
  alt: string;
  /** Оригинальные пропорции кадра — подставляются, если нет в манифесте */
  w: number;
  h: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Сдвиг кадра внутри контейнера (для фонов) */
  objectPosition?: string;
  quality?: number;
};

/**
 * Единственный компонент для всех кадров.
 *
 * Инварианты:
 *  • пропорции кадра сохраняются — обрезка задаётся только родителем (object-cover),
 *    сам <Shot> кадр не кадрирует;
 *  • размеры всегда проставлены → CLS не зависит от загрузки;
 *  • подложка — dominant color из манифеста, а не «скелетон»;
 *  • hero получает priority, всё остальное грузится лениво.
 */
export function Shot({
  src,
  alt,
  w,
  h,
  sizes = '100vw',
  priority = false,
  className = '',
  objectPosition,
  quality = 82,
}: ShotProps) {
  const meta = imageMeta(src);
  const width = meta?.width ?? w;
  const height = meta?.height ?? h;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      placeholder={meta?.blurDataURL ? 'blur' : 'empty'}
      blurDataURL={meta?.blurDataURL}
      quality={quality}
      className={className}
      style={{
        ...(objectPosition ? { objectPosition } : {}),
        backgroundColor: meta?.dominant ?? '#151517',
      }}
    />
  );
}
