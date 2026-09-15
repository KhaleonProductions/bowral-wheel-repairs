type Props = {
  src: string;
  poster: string;
  label: string;
  className?: string;
};

export default function VideoFrame({ src, poster, label, className = '' }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl ${className}`}
      style={{ aspectRatio: '9 / 16' }}
    >
      {/*
        Source files are 1024x576 (16:9) containers holding portrait 9:16
        footage pillarboxed with grey bars either side. Scaling to cover a 9:16
        frame pushes those bars outside the visible area.
        Do not change to object-contain - the bars come back.
      */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        aria-label={label}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-[var(--border-accent)]"
        aria-hidden="true"
      />
    </div>
  );
}
