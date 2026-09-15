'use client';

import { useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Scroll-reveal wrapper, built as progressive enhancement.
 *
 * The CSS default is VISIBLE (see .reveal in globals.css). JS adds the
 * `reveal-armed` class only after mount, which is what hides the element and
 * primes the animation; the observer then adds `reveal-in` to play it.
 *
 * Arming from JS rather than rendering hidden is deliberate. If the element
 * started at opacity 0 in the markup, anything that does not run
 * IntersectionObserver - JS disabled, a crawler, a full-page screenshot tool
 * that resizes rather than scrolls - would show a blank page. This way the
 * worst case is simply no animation.
 */
export default function Reveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.classList.add('reveal-armed');

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-in');
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    );
    io.observe(el);

    // Safety net: if the observer has not fired within 2.5s (an environment
    // that never scrolls, a resized viewport), show the content anyway.
    const failsafe = window.setTimeout(() => el.classList.add('reveal-in'), 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
