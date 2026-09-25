import { useEffect, useRef } from 'react';
import { pointerState } from '../lib/pointer';

const STATE_LABEL: Record<string, string> = {
  phone: 'TAP',
  link: '',
  text: '',
  default: '',
};

export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;

    const root = rootRef.current;
    const ring = ringRef.current;
    if (!root || !ring) return;

    document.body.classList.add('cursor-ready');

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let dx = tx;
    let dy = ty;
    let rx = tx;
    let ry = ty;
    let state = 'default';
    let raf = 0;
    let visible = false;

    const setState = (next: string) => {
      if (next === state) return;
      state = next;
      root.dataset.state = next;
      const label = ring.querySelector('.cursor__label');
      if (label) label.textContent = STATE_LABEL[next] ?? '';
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        dx = rx = tx;
        dy = ry = ty;
        root.classList.add('is-on');
      }

      const el = e.target as HTMLElement | null;
      if (pointerState.phoneHover) {
        setState('phone');
      } else if (el && el.closest('a, button, [data-cursor="link"]')) {
        setState('link');
      } else if (el && el.closest('input, textarea, [contenteditable="true"]')) {
        setState('text');
      } else {
        setState('default');
      }
    };

    const onLeave = () => {
      visible = false;
      root.classList.remove('is-on');
    };

    const tick = () => {
      dx += (tx - dx) * 0.32;
      dy += (ty - dy) * 0.32;
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      root.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      ring.style.transform = `translate(${rx - dx}px, ${ry - dy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      document.body.classList.remove('cursor-ready');
    };
  }, []);

  return (
    <div className="cursor" ref={rootRef} data-state="default" aria-hidden="true">
      <div className="cursor__dot" />
      <div className="cursor__ring" ref={ringRef}>
        <span className="cursor__label" />
      </div>
    </div>
  );
}
