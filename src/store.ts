import { useSyncExternalStore } from 'react';

export type ScreenMode = 'off' | 'launcher' | 'install' | 'app' | 'compose';
export type BuildPhase = 'idle' | 'building' | 'success' | 'installed';
export type Tab = 'builds' | 'insights' | 'run';

export type StageId =
  | 'hidden'
  | 'hero'
  | 'concepts'
  | 'playground'
  | 'pipeline'
  | 'launch'
  | 'compose'
  | 'features'
  | 'compare'
  | 'terminal'
  | 'path'
  | 'final';

export interface ComposeState {
  text: string;
  button: boolean;
  dark: boolean;
  accent: number;
  pulse: number;
}

export interface AppState {
  stage: StageId;
  screen: ScreenMode;
  build: BuildPhase;
  progress: number;
  tab: Tab;
  runPhase: 'idle' | 'running' | 'done';
  runProgress: number;
  compose: ComposeState;
  reducedMotion: boolean;
  tier: 'high' | 'medium' | 'low';
  flight: { id: number; from: { x: number; y: number } } | null;
  pageProgress: number;
}

const initialState: AppState = {
  stage: 'hidden',
  screen: 'off',
  build: 'idle',
  progress: 0,
  tab: 'builds',
  runPhase: 'idle',
  runProgress: 0,
  compose: { text: 'Android', button: true, dark: true, accent: 0, pulse: 0 },
  reducedMotion: false,
  tier: 'high',
  flight: null,
  pageProgress: 0,
};

let state: AppState = initialState;
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<AppState>) {
    let changed = false;
    for (const k of Object.keys(patch) as (keyof AppState)[]) {
      if (state[k] !== patch[k]) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    for (const l of listeners) l();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}

/** Mutable per-frame values that must never trigger React renders. */
export const frame = {
  phoneScreenPx: { x: 0, y: 0 },
  scrollVelocity: 0,
};

export const ACCENTS = ['#7f52ff', '#41d4ff', '#ff8a3d', '#5fd8a4'];
