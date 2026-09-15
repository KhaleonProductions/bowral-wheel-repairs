import MediaPlaceholder from './MediaPlaceholder';
import VideoFrame from './VideoFrame';
import Reveal from './Reveal';
import type { ProcessStepT } from '@/lib/schema';

const POSTER: Record<string, string> = {
  '/assets/video-cutting.mp4': '/assets/poster-cutting.jpg',
  '/assets/video-finished.mp4': '/assets/poster-finished.jpg',
};

export default function ProcessStep({ step, index }: { step: ProcessStepT; index: number }) {
  const flip = index % 2 === 1;
  const media = step.media;
  const isVideo = media?.src?.endsWith('.mp4') ?? false;

  return (
    <Reveal>
      <div className={`grid items-center gap-8 lg:grid-cols-2 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div>
          <span className="font-[family-name:var(--font-display)] text-5xl text-[var(--accent)]">
            {String(step.step).padStart(2, '0')}
          </span>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-wide">
            {step.title}
          </h2>
          <p className="mt-3 max-w-[54ch] text-[var(--color-steel)]">{step.detail}</p>
        </div>
        <div>
          {media && media.src && isVideo ? (
            <VideoFrame
              src={media.src}
              poster={POSTER[media.src] ?? '/assets/poster-cutting.jpg'}
              label={media.alt}
              className="mx-auto w-full max-w-[260px]"
            />
          ) : (
            <MediaPlaceholder
              shotNeeded={media?.shotNeeded ?? 'Workshop photo'}
              aspect="video"
            />
          )}
        </div>
      </div>
    </Reveal>
  );
}
