import Link from 'next/link';
import Hero from '@/components/Hero';
import SectionHeader from '@/components/SectionHeader';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import Prose from '@/components/Prose';
import VideoFrame from '@/components/VideoFrame';
import CTABanner from '@/components/CTABanner';
import { site } from '@/lib/content';
import { resolveTheme, logoPath } from '@/lib/theme';

export default function Home() {
  const logo = logoPath(resolveTheme());

  return (
    <>
      <Hero logoSrc={logo} />

      {/* Trust strip — capability claims only, no numbers or ratings. */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--surface)] py-10">
        <div className="mx-auto grid max-w-[var(--content-max)] gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.home.trust.map((t, i) => (
            <Reveal key={t.id} delay={i * 70}>
              <p className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-[var(--accent)]">
                {t.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-steel)]">{t.summary}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Damage types */}
      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="What we fix"
              title={site.home.damageIntro.heading}
              description={site.home.damageIntro.paragraphs[0]}
              center
            />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.home.damage.map((d, i) => (
              <Reveal key={d.id} delay={i * 60}>
                <Card title={d.title}>{d.summary}</Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="Services" title="What we do" center />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.services.map((s, i) => (
              <Reveal key={s.id} delay={i * 50}>
                <Link href="/services" className="block h-full">
                  <Card title={s.title} className="h-full">
                    {s.summary}
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* New to the Highlands */}
      <section className="texture-carbon bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.newcomer} />
          </Reveal>
        </div>
      </section>

      {/* Process teaser */}
      <section className="bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="Process" title="How a wheel gets fixed" center />
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.process.map((p, i) => (
              <Reveal key={p.id} delay={i * 50}>
                <li className="h-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
                  <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--accent)]">
                    {String(p.step).padStart(2, '0')}
                  </span>
                  <p className="mt-2 font-[family-name:var(--font-heading)] text-sm uppercase tracking-wide">
                    {p.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-steel)]">{p.summary}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link
              href="/process"
              className="font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
            >
              See the full process →
            </Link>
          </div>
        </div>
      </section>

      {/* The Result */}
      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <VideoFrame
              src="/assets/video-finished.mp4"
              poster="/assets/poster-finished.jpg"
              label="A finished diamond-cut wheel"
              className="mx-auto w-full max-w-[300px]"
            />
          </Reveal>
          <Reveal delay={90}>
            <Prose block={site.home.resultBlock} />
          </Reveal>
        </div>
      </section>

      {/* Straight answers */}
      <section className="bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.straightAnswers} />
          </Reveal>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
