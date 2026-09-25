import { store } from '../store';
import { prefersReducedMotion, sleep } from './math';

export const APK_FLIGHT_MS = 950;

let flightId = 0;
let busy = false;

export function isBusy() {
  return busy;
}

async function animateProgress(
  key: 'runProgress' | 'progress',
  duration: number,
  steps = 22,
) {
  const t0 = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 1.5);
      const v = p >= 1 ? 1 : Math.floor(eased * steps) / steps;
      if (key === 'runProgress') store.set({ runProgress: v });
      else store.set({ progress: v });
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

/** Gradle build: source -> BUILD SUCCESSFUL. */
export async function runBuild(duration = 3400) {
  if (busy) return false;
  busy = true;
  const fast = prefersReducedMotion();
  store.set({ tab: 'run', runPhase: 'running', runProgress: 0, build: 'building' });
  await animateProgress('runProgress', fast ? 600 : duration);
  store.set({ runPhase: 'done', runProgress: 1, build: 'success' });
  await sleep(fast ? 120 : 420);
  busy = false;
  return true;
}

/** APK -> device -> install -> launch. */
export async function installOnDevice(from?: { x: number; y: number }) {
  if (busy) return false;
  busy = true;
  const fast = prefersReducedMotion();

  store.set({
    flight: from ? { id: ++flightId, from } : null,
    build: 'building',
    progress: 0,
  });

  await sleep(fast ? 180 : APK_FLIGHT_MS);
  store.set({ screen: 'launcher', progress: 0 });
  await sleep(fast ? 220 : 780);

  store.set({ screen: 'install', progress: 0 });
  await animateProgress('progress', fast ? 500 : 2100, 26);
  store.set({ progress: 1, build: 'installed' });

  await sleep(fast ? 250 : 750);
  store.set({ screen: 'app', build: 'success', tab: 'builds' });
  await sleep(100);
  busy = false;
  return true;
}

/** Full chain used by the playground / terminal "big moment". */
export async function buildAndLaunch(from?: { x: number; y: number }, buildMs = 3400) {
  const ok = await runBuild(buildMs);
  if (!ok) return false;
  await sleep(prefersReducedMotion() ? 100 : 520);
  return installOnDevice(from);
}

export function rectCenter(el: Element | null): { x: number; y: number } {
  if (!el) return { x: window.innerWidth * 0.4, y: window.innerHeight * 0.5 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
