type Props = {
  shotNeeded: string;
  className?: string;
  aspect?: 'square' | 'video' | 'portrait';
};

const ASPECT: Record<NonNullable<Props['aspect']>, string> = {
  square: '1 / 1',
  video: '16 / 9',
  portrait: '9 / 16',
};

/**
 * A clearly-labelled slot awaiting Bowral Wheel Repairs' own photography.
 * Never renders a broken image and never substitutes stock or competitor
 * imagery - the label states what shot belongs here.
 */
export default function MediaPlaceholder({
  shotNeeded,
  className = '',
  aspect = 'video',
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-accent)] bg-[var(--surface)] p-6 text-center ${className}`}
      style={{ aspectRatio: ASPECT[aspect] }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-10 w-10 fill-[var(--accent)] opacity-60"
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 3.5a6.5 6.5 0 0 1 6.5 6.5A6.5 6.5 0 0 1 12 18.5 6.5 6.5 0 0 1 5.5 12 6.5 6.5 0 0 1 12 5.5zm0 2.6a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8z" />
      </svg>
      <p className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
        Photo coming soon
      </p>
      <p className="text-xs text-[var(--color-steel)]">{shotNeeded}</p>
    </div>
  );
}
