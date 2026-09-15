import type { Metadata } from 'next';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';
import Prose from '@/components/Prose';
import Card from '@/components/Card';
import Reveal from '@/components/Reveal';
import CTABanner from '@/components/CTABanner';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.about.title,
  description: site.seo.about.description,
};

export default function AboutPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.newcomer} />
          </Reveal>
        </div>
      </section>

      {/* Our story */}
      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <Prose block={site.about.story} />
          </Reveal>
        </div>
      </section>

      {/* The Workshop — the CNC lathe */}
      <section className="bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="The workshop" title={site.workshop.heading} />
          </Reveal>
          <Reveal delay={80}>
            <figure className="overflow-hidden rounded-xl border border-[var(--border-accent)]">
              <Image
                src="/assets/lathe.jpg"
                alt="Our CNC wheel lathe installed in the Bowral workshop"
                width={1800}
                height={1350}
                className="h-auto w-full"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
              <figcaption className="bg-[var(--surface)] px-5 py-3 text-sm text-[var(--color-steel)]">
                Our CNC wheel lathe, installed at Mount Road, Bowral.
              </figcaption>
            </figure>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-10">
              {site.workshop.paragraphs.map((p) => (
                <p key={p} className="mb-4 max-w-[62ch] text-[var(--color-steel)] last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader eyebrow="Why us" title="What you get" center />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {site.whyUs.map((w, i) => (
              <Reveal key={w.id} delay={i * 60}>
                <Card title={w.title} className="h-full">
                  {w.summary}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Straight answers */}
      <section className="texture-carbon bg-[var(--base-deep)] py-[var(--section-pad)]">
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
