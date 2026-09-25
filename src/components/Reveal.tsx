import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'span' | 'li' | 'p' | 'h2' | 'h3';
  style?: CSSProperties;
}

/** Fades + lifts content into view once. */
export function Reveal({ children, delay = 0, className = '', as = 'div', style }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Tag = as as 'div';
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={{ ...style, ['--d' as string]: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}

/** Word-by-word staggered headline reveal. */
export function RevealWords({
  text,
  className = '',
  delay = 0,
  step = 0.055,
  id,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <div
      ref={ref}
      id={id}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={{ ['--d' as string]: `${delay}s` }}
    >
      {words.map((w, i) => (
        <span className="word" key={`${w}-${i}`}>
          <span style={{ ['--wd' as string]: `${delay + i * step}s` }}>{w}</span>
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </div>
  );
}
