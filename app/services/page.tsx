import type { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import CTABanner from '@/components/CTABanner';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.services.title,
  description: site.seo.services.description,
};

export default function ServicesPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="Services"
              title="What we can do with your wheels"
              description={site.quoteCta.note}
              center
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-10 px-6">
          {site.services.map((s) => (
            <Reveal key={s.id}>
              <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-8">
                <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-[var(--color-ink)]">
                  {s.title}
                </h2>
                <p className="mt-2 text-[var(--color-chrome)]">{s.summary}</p>
                <dl className="mt-6 grid gap-6 sm:grid-cols-3">
                  <div>
                    <dt className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                      What it is
                    </dt>
                    <dd className="mt-2 text-sm text-[var(--color-steel)]">{s.what}</dd>
                  </div>
                  <div>
                    <dt className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                      What it fixes
                    </dt>
                    <dd className="mt-2 text-sm text-[var(--color-steel)]">{s.fixes}</dd>
                  </div>
                  <div>
                    <dt className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                      How it&rsquo;s done
                    </dt>
                    <dd className="mt-2 text-sm text-[var(--color-steel)]">{s.how}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
