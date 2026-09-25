import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export type Tier = 'high' | 'medium' | 'low';

/**
 * Device capability tier — drives particle count, shadow quality, DPR and
 * whether the 3D scene renders at all.
 */
export function useDeviceTier(): Tier {
  const [tier, setTier] = useState<Tier>('high');

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const narrow = window.innerWidth < 820;
    const cores = navigator.hardwareConcurrency ?? 8;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

    let t: Tier = 'high';
    if (coarse || narrow || cores <= 4 || mem <= 4) t = 'medium';
    if ((coarse && cores <= 4) || mem <= 2 || window.innerWidth < 420) t = 'low';
    setTier(t);

    const onResize = () => {
      const w = window.innerWidth;
      if (w < 420) setTier('low');
      else if (w < 820) setTier('medium');
      else setTier('high');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return tier;
}
