import Image from 'next/image';
import Link from 'next/link';
import VideoFrame from './VideoFrame';
import { site } from '@/lib/content';

export default function Hero({ logoSrc, plate }: { logoSrc: string; plate: boolean }) {
  return (
    <section className="texture-carbon bg-mesh relative overflow-hidden bg-[var(--base-deep)] py-[var(--section-pad)]">
      <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-12 px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Image
            src={logoSrc}
            alt={site.business.name}
            width={128}
            height={128}
            priority
            className={
              plate
                ? 'mb-8 rounded-lg shadow-2xl'
                : 'mb-8 [filter:drop-shadow(0_0_28px_rgba(120,190,255,0.28))]'
            }
          />
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.8rem,8vw,5.5rem)] leading-[1.03] tracking-wide">
            {site.home.heroHeadline.map((line, i) => (
              <span key={line} className={i === 0 ? 'block text-[var(--accent)]' : 'chrome-text block'}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-[var(--color-chrome)]">{site.home.heroSub}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-[var(--accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--accent-bright)]"
            >
              {site.quoteCta.label}
            </Link>
            <a
              href={site.contact.phoneHref}
              className="rounded-md border border-[var(--border-accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-[var(--color-ink)] transition-colors hover:border-[var(--accent)]"
            >
              {site.contact.phone}
            </a>
          </div>
        </div>

        <VideoFrame
          src="/assets/video-cutting.mp4"
          poster="/assets/poster-cutting.jpg"
          label="A wheel being machined on our CNC lathe"
          className="mx-auto w-full max-w-[320px]"
        />
      </div>
    </section>
  );
}
