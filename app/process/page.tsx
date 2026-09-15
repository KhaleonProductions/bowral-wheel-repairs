import type { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import ProcessStep from '@/components/ProcessStep';
import CTABanner from '@/components/CTABanner';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.process.title,
  description: site.seo.process.description,
};

export default function ProcessPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="Our process"
              title="From drop-off to back on the car"
              description="Seven stages. Every wheel goes through the ones it needs, and none it doesn't."
              center
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-20 px-6">
          {site.process.map((step, i) => (
            <ProcessStep key={step.id} step={step} index={i} />
          ))}
        </div>
      </section>

      <CTABanner heading="Bring us a wheel" />
    </>
  );
}
