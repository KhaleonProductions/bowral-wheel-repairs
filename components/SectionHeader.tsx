type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
};

export default function SectionHeader({ eyebrow, title, description, center = false }: Props) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {eyebrow ? (
        <span
          className={`mb-3 inline-flex items-center gap-2 font-[family-name:var(--font-heading)] text-xs uppercase tracking-[0.2em] text-[var(--accent)] ${
            center ? 'justify-center' : ''
          }`}
        >
          <span className="h-px w-8 bg-[var(--accent)]" aria-hidden="true" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-wide sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-[60ch] text-[var(--color-steel)] ${center ? 'mx-auto' : ''}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
