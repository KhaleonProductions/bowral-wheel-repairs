'use client';

import { useState } from 'react';
import MediaPlaceholder from '@/components/MediaPlaceholder';
import VideoFrame from '@/components/VideoFrame';
import SectionHeader from '@/components/SectionHeader';
import Reveal from '@/components/Reveal';
import { site } from '@/lib/content';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'diamond-cut', label: 'Diamond Cut' },
  { id: 'straightening', label: 'Straightening' },
  { id: 'refurbishment', label: 'Refurbishment' },
  { id: 'custom-colour', label: 'Custom Colour' },
] as const;

export default function GalleryPage() {
  const [active, setActive] = useState<string>('all');
  const items = active === 'all' ? site.gallery : site.gallery.filter((g) => g.category === active);

  return (
    <>
      <section className="texture-carbon bg-mesh bg-[var(--base-deep)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <Reveal>
            <SectionHeader
              eyebrow="Our work"
              title="Wheels off the lathe"
              description="We're building this gallery as jobs come through the workshop. In the meantime, here's one straight off the machine."
              center
            />
          </Reveal>
          <Reveal delay={80}>
            <VideoFrame
              src="/assets/video-finished.mp4"
              poster="/assets/poster-finished.jpg"
              label="A finished diamond-cut wheel"
              className="mx-auto w-full max-w-[300px]"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--base)] py-[var(--section-pad)]">
        <div className="mx-auto max-w-[var(--content-max)] px-6">
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c.id)}
                aria-pressed={active === c.id}
                className={`rounded-md border px-4 py-2 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.14em] transition-colors ${
                  active === c.id
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border-subtle)] text-[var(--color-steel)] hover:border-[var(--accent)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g) => (
              <figure key={g.id}>
                <MediaPlaceholder shotNeeded={g.media.shotNeeded} aspect="square" />
                <figcaption className="mt-3 text-sm text-[var(--color-steel)]">
                  {g.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
