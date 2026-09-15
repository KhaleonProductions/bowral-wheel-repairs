'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/lib/content';

export default function Nav({ logoSrc, plate }: { logoSrc: string; plate: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--base-deep)]/92 backdrop-blur"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-[var(--content-max)] items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${site.business.name} — Home`}
        >
          <Image
            src={logoSrc}
            alt={`${site.business.name} logo`}
            width={44}
            height={44}
            className={plate ? 'rounded' : ''}
            priority
          />
          <span className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-heading)] text-base font-semibold uppercase tracking-wide text-[var(--color-ink)]">
              {site.business.name}
            </span>
            <span className="font-[family-name:var(--font-heading)] text-[0.65rem] uppercase tracking-[0.2em] text-[var(--accent)]">
              {site.business.region}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded px-3 py-2 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-[var(--color-chrome)] transition-colors hover:text-[var(--color-ink)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={site.contact.phoneHref}
              className="ml-2 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--accent-bright)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              Call Now
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 stroke-[var(--color-ink)]"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open ? (
        <ul className="border-t border-[var(--border-subtle)] bg-[var(--base-deep)] px-6 pb-4 lg:hidden">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-[var(--border-subtle)] py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-[var(--color-chrome)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-4">
            <a
              href={site.contact.phoneHref}
              className="block rounded-md bg-[var(--accent)] px-4 py-3 text-center font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.1em] text-white"
            >
              Call {site.contact.phone}
            </a>
          </li>
        </ul>
      ) : null}
    </nav>
  );
}
