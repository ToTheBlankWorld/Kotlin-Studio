import { useEffect, useState, type RefObject } from 'react';

export interface InViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
}

/** IntersectionObserver as a hook. Fires with the latest intersecting state. */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0.25, rootMargin = '0px 0px -8% 0px', once = false }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting && once) obs.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, rootMargin, once]);

  return inView;
}

/** Returns 0..1 progress of an element travelling through the viewport. */
export function useScrollProgress(ref: RefObject<Element | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const passed = vh - rect.top;
      setProgress(Math.min(1, Math.max(0, passed / total)));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);

  return progress;
}
