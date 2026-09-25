import { useEffect, useRef } from 'react';
import { store, useStore, frame } from '../../store';
import { APK_FLIGHT_MS } from '../../lib/sequence';

export function ApkGlyph({ size = 64 }: { size?: number }) {
  return (
    <div className="apk-glyph" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width={size * 0.58} height={size * 0.58} fill="none">
        <path
          d="M14 30.5 9.5 24.8a1.6 1.6 0 0 1 2.4-2.1L14 24.4V13.2a1.7 1.7 0 0 1 3.4 0v9.3h13.2v-9.3a1.7 1.7 0 1 1 3.4 0v11.2l2.1-1.7a1.6 1.6 0 0 1 2.4 2.1L34 30.5a7.6 7.6 0 0 1-4.6 1.6h-10.8A7.6 7.6 0 0 1 14 30.5ZM17.6 34.4a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Zm12.8 0a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function FlightItem({ from }: { from: { x: number; y: number } }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t0 = performance.now();
    let raf = 0;

    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / APK_FLIGHT_MS);
      const e = 1 - Math.pow(1 - p, 3);
      const tx = frame.phoneScreenPx.x;
      const ty = frame.phoneScreenPx.y;
      const x = from.x + (tx - from.x) * e;
      const y = from.y + (ty - from.y) * e;
      const s = 1 + (0.14 - 1) * e;
      const rot = 6 * Math.sin(e * Math.PI) - 10 * e;
      const op = p < 0.12 ? p / 0.12 : p > 0.86 ? Math.max(0, (1 - p) / 0.14) : 1;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s}) rotate(${rot}deg)`;
      el.style.opacity = String(op);
      if (p < 1) raf = requestAnimationFrame(tick);
      else store.set({ flight: null });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from.x, from.y]);

  return (
    <div className="apk-flight" ref={ref} aria-hidden="true">
      <ApkGlyph size={66} />
      <span className="apk-flight__label mono">app-debug.apk</span>
      <span className="apk-flight__size mono">4.2 MB</span>
    </div>
  );
}

export function ApkFlight() {
  const flight = useStore((s) => s.flight);
  if (!flight) return null;
  return (
    <div className="apk-flight-layer" aria-hidden="true">
      <FlightItem key={flight.id} from={flight.from} />
    </div>
  );
}
