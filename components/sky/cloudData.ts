import type { Cloud } from './types';

export const CLOUDS: Cloud[] = [
  { x: 0.1, y: 0.6, scale: 0.4, depth: 0.12, puffs: [{ x: -0.08, y: 0.0, r: 0.1, alpha: 0.7 }, { x: 0.0, y: -0.02, r: 0.11, alpha: 0.75 }, { x: 0.08, y: 0.02, r: 0.09, alpha: 0.7 }] },
  { x: 0.35, y: 0.62, scale: 0.42, depth: 0.15, puffs: [{ x: -0.09, y: 0.01, r: 0.1, alpha: 0.72 }, { x: 0.0, y: -0.02, r: 0.11, alpha: 0.78 }, { x: 0.09, y: 0.02, r: 0.1, alpha: 0.72 }] },
  { x: 0.78, y: 0.66, scale: 0.45, depth: 0.2, puffs: [{ x: -0.1, y: 0.02, r: 0.11, alpha: 0.75 }, { x: 0.0, y: -0.02, r: 0.12, alpha: 0.8 }, { x: 0.1, y: 0.02, r: 0.1, alpha: 0.75 }] },
  { x: 0.15, y: 0.9, scale: 0.65, depth: 0.35, puffs: [{ x: -0.09, y: 0.02, r: 0.11, alpha: 0.92 }, { x: -0.02, y: -0.02, r: 0.12, alpha: 0.95 }, { x: 0.06, y: 0.0, r: 0.11, alpha: 0.95 }, { x: 0.12, y: 0.04, r: 0.1, alpha: 0.9 }, { x: 0.0, y: 0.06, r: 0.12, alpha: 0.92 }] },
  { x: 0.55, y: 0.82, scale: 0.7, depth: 0.4, puffs: [{ x: -0.1, y: 0.02, r: 0.12, alpha: 0.92 }, { x: -0.02, y: -0.03, r: 0.13, alpha: 0.95 }, { x: 0.06, y: 0.0, r: 0.12, alpha: 0.95 }, { x: 0.13, y: 0.04, r: 0.11, alpha: 0.9 }, { x: 0.0, y: 0.07, r: 0.13, alpha: 0.92 }] },
  { x: 0.28, y: 0.84, scale: 0.8, depth: 0.6, puffs: [{ x: -0.1, y: 0.02, r: 0.13, alpha: 0.95 }, { x: -0.02, y: -0.03, r: 0.14, alpha: 0.98 }, { x: 0.06, y: 0.0, r: 0.13, alpha: 0.98 }, { x: 0.13, y: 0.04, r: 0.12, alpha: 0.92 }, { x: 0.0, y: 0.07, r: 0.14, alpha: 0.95 }] },
  { x: 0.68, y: 0.86, scale: 0.85, depth: 0.55, puffs: [{ x: -0.12, y: 0.03, r: 0.14, alpha: 0.95 }, { x: -0.03, y: -0.02, r: 0.15, alpha: 0.98 }, { x: 0.06, y: 0.01, r: 0.14, alpha: 0.98 }, { x: 0.14, y: 0.05, r: 0.13, alpha: 0.92 }, { x: 0.0, y: 0.08, r: 0.15, alpha: 0.95 }] },
  { x: 0.45, y: 0.92, scale: 1.05, depth: 0.85, puffs: [{ x: -0.18, y: 0.0, r: 0.16, alpha: 0.95 }, { x: -0.08, y: -0.02, r: 0.15, alpha: 0.98 }, { x: 0.02, y: 0.0, r: 0.16, alpha: 1 }, { x: 0.12, y: 0.01, r: 0.15, alpha: 0.98 }, { x: 0.22, y: 0.03, r: 0.14, alpha: 0.95 }] },
  { x: 0.88, y: 0.8, scale: 1.15, depth: 0.95, puffs: [{ x: -0.1, y: 0.05, r: 0.17, alpha: 1 }, { x: -0.02, y: -0.02, r: 0.18, alpha: 1 }, { x: 0.07, y: 0.02, r: 0.16, alpha: 1 }, { x: 0.15, y: 0.06, r: 0.15, alpha: 0.98 }, { x: 0.0, y: 0.09, r: 0.17, alpha: 0.98 }, { x: -0.15, y: 0.09, r: 0.14, alpha: 0.95 }] },
  { x: 0.08, y: 0.78, scale: 1.2, depth: 1.0, puffs: [{ x: -0.12, y: 0.04, r: 0.2, alpha: 1 }, { x: -0.04, y: -0.04, r: 0.18, alpha: 1 }, { x: 0.05, y: 0.0, r: 0.17, alpha: 1 }, { x: 0.13, y: 0.06, r: 0.15, alpha: 1 }, { x: 0.0, y: 0.08, r: 0.19, alpha: 0.98 }, { x: -0.08, y: 0.1, r: 0.16, alpha: 0.98 }, { x: 0.18, y: 0.1, r: 0.14, alpha: 0.95 }] },
];

export const CLOUDS_BY_DEPTH: Cloud[] = [...CLOUDS].sort((a, b) => a.depth - b.depth);
export const SKY_TINT = { r: 195, g: 223, b: 240 };
export const SKY_STOPS: ReadonlyArray<{ t: number; color: string }> = [{ t: 0, color: '#b8dff0' }, { t: 0.35, color: '#cce8f3' }, { t: 0.65, color: '#e2f1f8' }, { t: 1, color: '#f0f7fb' }];
