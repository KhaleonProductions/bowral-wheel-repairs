import type { Metadata } from 'next';
import SectionHeader from '@/components/SectionHeader';
import QuoteForm from '@/components/QuoteForm';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: site.seo.contact.title,
  description: site.seo.contact.description,
};

const MAP_SRC = 'https://www.google.com/maps?q=8+Mount+Rd,+Bowral+NSW+2576&output=embed';

export default function ContactPage() {
  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="Contact"
              title={site.contactPage.intro.heading}
              description={site.contactPage.intro.paragraphs[0]}
              center
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto grid max-w-[var(--content-max)] gap-12 px-6 lg:grid-cols-[1fr_0.8fr]">
          <Reveal>
            <QuoteForm />
          </Reveal>

          <Reveal delay={90}>
            <div className="grid gap-6">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                <h2 className="mb-4 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
                  Find us
                </h2>
                <p className="text-sm text-[var(--color-steel)]">
                  {site.contact.street}
                  <br />
                  {site.contact.locality} {site.contact.region} {site.contact.postcode}
                </p>
                <p className="mt-4 text-sm">
                  <a href={site.contact.phoneHref} className="text-[var(--accent)]">
                    {site.contact.phone}
                  </a>
                  <br />
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="break-all text-[var(--color-steel)]"
                  >
                    {site.contact.email}
                  </a>
                </p>
                <p className="mt-4 text-sm text-[var(--color-steel)]">{site.contact.hours}</p>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
                <iframe
                  src={MAP_SRC}
                  title="Map showing our Bowral workshop"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[320px] w-full border-0"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
