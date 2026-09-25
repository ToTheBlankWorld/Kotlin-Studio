import type { StageId } from '../store';

export interface StagePose {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
}

/** Desktop poses (viewport world units, camera at z=6.4 / fov 32). */
export const STAGES: Record<StageId, StagePose> = {
  hidden: { pos: [4.8, 0, -1.4], rot: [0.12, -0.75, 0.02], scale: 0.85 },
  hero: { pos: [1.5, -0.02, 0], rot: [0.05, -0.46, 0.035], scale: 1 },
  concepts: { pos: [4.6, 0.25, -1.2], rot: [0.12, -0.8, 0], scale: 0.85 },
  playground: { pos: [1.66, 0, 0.18], rot: [0.04, -0.5, 0.03], scale: 1.02 },
  pipeline: { pos: [2.7, -0.12, -1.5], rot: [0.07, -0.55, 0], scale: 0.88 },
  launch: { pos: [0, -0.1, 0.6], rot: [0.05, -0.12, 0], scale: 1.1 },
  compose: { pos: [1.48, 0, 0.12], rot: [0.04, -0.4, 0.03], scale: 1.06 },
  features: { pos: [4.7, 0, -1.2], rot: [0.12, -0.8, 0], scale: 0.85 },
  compare: { pos: [4.7, 0, -1.2], rot: [0.12, -0.8, 0], scale: 0.85 },
  terminal: { pos: [2.55, -0.05, -0.7], rot: [0.05, -0.6, 0], scale: 0.95 },
  path: { pos: [4.7, 0, -1.2], rot: [0.12, -0.8, 0], scale: 0.85 },
  final: { pos: [0, -0.9, 0.2], rot: [0.04, -0.1, 0], scale: 1 },
};

/** Narrow-viewport poses: the phone stays centred and the copy takes panels. */
export const MOBILE_STAGES: Record<StageId, StagePose> = {
  hidden: { pos: [3.4, 0, -2], rot: [0.1, -0.7, 0], scale: 0.6 },
  hero: { pos: [0, -0.62, -0.5], rot: [0.06, -0.2, 0.03], scale: 0.68 },
  concepts: { pos: [3.4, 0, -2], rot: [0.1, -0.7, 0], scale: 0.6 },
  playground: { pos: [0, -0.7, -0.2], rot: [0.05, -0.18, 0.02], scale: 0.58 },
  pipeline: { pos: [3.4, -0.2, -2.4], rot: [0.1, -0.7, 0], scale: 0.55 },
  launch: { pos: [0, -1, 0.3], rot: [0.05, -0.1, 0], scale: 0.72 },
  compose: { pos: [3.4, -0.2, -2.4], rot: [0.1, -0.7, 0], scale: 0.55 },
  features: { pos: [3.4, 0, -2], rot: [0.1, -0.7, 0], scale: 0.6 },
  compare: { pos: [3.4, 0, -2], rot: [0.1, -0.7, 0], scale: 0.6 },
  terminal: { pos: [3.4, -0.2, -2.4], rot: [0.1, -0.7, 0], scale: 0.55 },
  path: { pos: [3.4, 0, -2], rot: [0.1, -0.7, 0], scale: 0.6 },
  final: { pos: [0, -0.5, 0.2], rot: [0.04, -0.08, 0], scale: 0.66 },
};
