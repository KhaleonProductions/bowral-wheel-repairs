import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/content';

export default function Footer({ logoSrc }: { logoSrc: string }) {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--base-deep)] py-14">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="mb-4 flex items-center gap-3">
            <Image
              src={logoSrc}
              alt={`${site.business.name} logo`}
              width={40}
              height={40}
              className="rounded"
            />
            <span className="font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wide">
              {site.business.name}
            </span>
          </Link>
          <p className="text-sm text-[var(--color-steel)]">{site.business.tagline}</p>
        </div>

        <div>
          <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Pages
          </h2>
          <ul className="space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[var(--color-steel)] transition-colors hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Services
          </h2>
          <ul className="space-y-2 text-sm">
            {site.services.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link
                  href="/services"
                  className="text-[var(--color-steel)] transition-colors hover:text-[var(--color-ink)]"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Contact
          </h2>
          <ul className="space-y-2 text-sm text-[var(--color-steel)]">
            <li>
              <a
                href={site.contact.phoneHref}
                className="transition-colors hover:text-[var(--color-ink)]"
              >
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="break-all transition-colors hover:text-[var(--color-ink)]"
              >
                {site.contact.email}
              </a>
            </li>
            <li>
              {site.contact.street}, {site.contact.locality}
              <br />
              {site.contact.region} {site.contact.postcode}
            </li>
            <li className="pt-2">{site.contact.hours}</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[var(--content-max)] border-t border-[var(--border-subtle)] px-6 pt-6 text-xs text-[var(--color-steel)]">
        © {new Date().getFullYear()} {site.business.name}. All rights reserved.
      </div>
    </footer>
  );
}
