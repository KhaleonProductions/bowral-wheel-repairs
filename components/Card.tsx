type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function Card({ title, children, className = '' }: Props) {
  return (
    <div
      className={`group rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 transition-colors duration-300 hover:border-[var(--border-accent)] ${className}`}
    >
      <h3 className="mb-2 font-[family-name:var(--font-heading)] text-lg uppercase tracking-wide text-[var(--color-ink)]">
        {title}
      </h3>
      <div className="text-sm text-[var(--color-steel)]">{children}</div>
    </div>
  );
}
