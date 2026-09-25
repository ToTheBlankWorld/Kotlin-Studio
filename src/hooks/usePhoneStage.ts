import { useEffect, useRef, type RefObject } from 'react';
import { store, type StageId } from '../store';

/**
 * Registers the enclosing section as the owner of the 3D phone stage.
 * The section claims ownership once it is sufficiently visible and hands it
 * back when it leaves the viewport.
 */
export function usePhoneStage<T extends HTMLElement = HTMLElement>(
  stage: StageId,
  threshold = 0.35,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ratio = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === el) ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        }
        if (ratio >= threshold) store.set({ stage });
        else if (store.get().stage === stage) store.set({ stage: 'hidden' });
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.8, 1] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stage, threshold]);

  return ref;
}
