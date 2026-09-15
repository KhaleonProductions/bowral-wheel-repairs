import Link from 'next/link';
import { site } from '@/lib/content';

/** The call to action is always a quote request, never a price. */
export default function CTABanner({ heading = 'Get a Quote' }: { heading?: string }) {
  return (
    <section className="bg-[var(--base)] py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-6">
        <div className="bg-mesh rounded-2xl border border-[var(--border-accent)] bg-[var(--surface)] p-10 text-center sm:p-14">
          <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-wide sm:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[var(--color-chrome)]">
            {site.quoteCta.note}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
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
      </div>
    </section>
  );
}
