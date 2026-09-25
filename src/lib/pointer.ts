/** Pointer position in normalised device coordinates, tracked outside R3F. */
export const pointerNDC = { x: 0, y: 0 };
export const pointerPx = { x: 0, y: 0 };
export const pointerState = { active: false, phoneHover: false };

let bound = false;

export function bindPointer() {
  if (bound) return;
  bound = true;

  const onMove = (e: PointerEvent) => {
    pointerPx.x = e.clientX;
    pointerPx.y = e.clientY;
    pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerState.active = true;
  };
  const onLeave = () => {
    pointerState.active = false;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
}
