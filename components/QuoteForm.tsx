'use client';

import { useState } from 'react';
import { site } from '@/lib/content';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const FIELD =
  'w-full rounded-md border border-[var(--border-subtle)] bg-[var(--base-deep)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--accent)]';
const LABEL =
  'font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.16em] text-[var(--color-chrome)]';

export default function QuoteForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Could not send your enquiry.');
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl border border-[var(--border-accent)] bg-[var(--surface)] p-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-wide">
          Thanks — that&rsquo;s come through.
        </h2>
        <p className="mt-3 text-[var(--color-steel)]">
          We&rsquo;ll take a look and get back to you. If it&rsquo;s urgent, give us a ring on{' '}
          <a href={site.contact.phoneHref} className="text-[var(--accent)]">
            {site.contact.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className={LABEL}>Name</span>
          <input name="name" required autoComplete="name" className={FIELD} />
        </label>
        <label className="grid gap-2">
          <span className={LABEL}>Phone</span>
          <input name="phone" required autoComplete="tel" inputMode="tel" className={FIELD} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className={LABEL}>Email</span>
        <input name="email" type="email" required autoComplete="email" className={FIELD} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className={LABEL}>Vehicle</span>
          <input name="vehicle" placeholder="e.g. 2019 Subaru Forester" className={FIELD} />
        </label>
        <label className="grid gap-2">
          <span className={LABEL}>Wheel size</span>
          <input name="wheelSize" placeholder="e.g. 18 inch" className={FIELD} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className={LABEL}>Damage</span>
        <select name="damageType" className={FIELD} defaultValue="">
          <option value="" disabled>
            Select the closest match
          </option>
          {site.home.damage.map((d) => (
            <option key={d.id} value={d.title}>
              {d.title}
            </option>
          ))}
          <option value="Not sure">Not sure</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className={LABEL}>Tell us about it</span>
        <textarea name="message" rows={5} required className={FIELD} />
      </label>

      <p className="text-xs text-[var(--color-steel)]">{site.contactPage.formNote}</p>

      {status === 'error' ? (
        <p role="alert" className="text-sm text-[var(--accent-bright)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="justify-self-start rounded-md bg-[var(--accent)] px-7 py-3 font-[family-name:var(--font-heading)] text-sm uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--accent-bright)] disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : site.quoteCta.label}
      </button>
    </form>
  );
}
