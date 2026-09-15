import type { CopyBlockT } from '@/lib/schema';

/**
 * Renders a copy block's paragraphs. Supports *emphasis* markers because the
 * approved copy uses them ("we mean in *this* house").
 */
function withEmphasis(text: string, key: number) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <p key={key} className="mb-4 max-w-[62ch] text-[var(--color-steel)] last:mb-0">
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
          <em key={i} className="font-semibold not-italic text-[var(--color-ink)]">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export default function Prose({
  block,
  className = '',
}: {
  block: CopyBlockT;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-5 font-[family-name:var(--font-display)] text-3xl leading-tight tracking-wide sm:text-4xl">
        {block.heading}
      </h3>
      {block.paragraphs.map(withEmphasis)}
    </div>
  );
}
