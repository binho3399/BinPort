import { SKY_TINT } from './cloudData';
import { SPRITE_BLUR, SPRITE_RADIUS, SPRITE_SIZE } from './constants';
import type { Cloud, RenderCloud, RenderPuff, Puff } from './types';

export function buildPuffSprite(cloud: Cloud, puff: Puff): HTMLCanvasElement {
  const depth = cloud.depth;
  const r = Math.round(SKY_TINT.r + (255 - SKY_TINT.r) * depth);
  const g = Math.round(SKY_TINT.g + (255 - SKY_TINT.g) * depth);
  const b = Math.round(SKY_TINT.b + (255 - SKY_TINT.b) * depth);
  const alphaMul = 0.5 + depth * 0.5;
  const a = puff.alpha * alphaMul;
  const fadeStart = 0.36 + depth * 0.16;
  const fadeMid = 0.72 + depth * 0.12;
  const midAlpha = 0.48 - depth * 0.1;
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const c = SPRITE_SIZE / 2;
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const blueShadow = {
    r: clamp(SKY_TINT.r - 26 + depth * 10),
    g: clamp(SKY_TINT.g - 18 + depth * 8),
    b: clamp(SKY_TINT.b + 8),
  };

  ctx.filter = `blur(${SPRITE_BLUR}px)`;
  const body = ctx.createRadialGradient(
    c - SPRITE_RADIUS * 0.12,
    c - SPRITE_RADIUS * 0.24,
    SPRITE_RADIUS * 0.04,
    c + SPRITE_RADIUS * 0.02,
    c + SPRITE_RADIUS * 0.04,
    SPRITE_RADIUS,
  );
  body.addColorStop(0, `rgba(255, 255, 255, ${a * 0.96})`);
  body.addColorStop(0.2, `rgba(${clamp(r + 12)}, ${clamp(g + 14)}, ${clamp(b + 16)}, ${a * 0.9})`);
  body.addColorStop(fadeStart, `rgba(${r}, ${g}, ${b}, ${a * 0.78})`);
  body.addColorStop(fadeMid, `rgba(${clamp(r - 8)}, ${clamp(g - 4)}, ${clamp(b + 4)}, ${a * midAlpha})`);
  body.addColorStop(0.94, `rgba(${SKY_TINT.r}, ${SKY_TINT.g}, ${SKY_TINT.b}, ${a * 0.08})`);
  body.addColorStop(1, `rgba(${SKY_TINT.r}, ${SKY_TINT.g}, ${SKY_TINT.b}, 0)`);
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  const lowerShade = ctx.createRadialGradient(
    c + SPRITE_RADIUS * 0.3,
    c + SPRITE_RADIUS * 0.38,
    SPRITE_RADIUS * 0.06,
    c + SPRITE_RADIUS * 0.1,
    c + SPRITE_RADIUS * 0.16,
    SPRITE_RADIUS * 0.82,
  );
  lowerShade.addColorStop(0, `rgba(${blueShadow.r}, ${blueShadow.g}, ${blueShadow.b}, ${a * 0.18})`);
  lowerShade.addColorStop(0.42, `rgba(${blueShadow.r}, ${blueShadow.g}, ${blueShadow.b}, ${a * 0.08})`);
  lowerShade.addColorStop(1, `rgba(${SKY_TINT.r}, ${SKY_TINT.g}, ${SKY_TINT.b}, 0)`);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = lowerShade;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  ctx.filter = 'none';

  ctx.globalCompositeOperation = 'screen';
  const innerGlow = ctx.createRadialGradient(
    c - SPRITE_RADIUS * 0.18,
    c - SPRITE_RADIUS * 0.18,
    0,
    c - SPRITE_RADIUS * 0.04,
    c - SPRITE_RADIUS * 0.04,
    SPRITE_RADIUS * 0.68,
  );
  innerGlow.addColorStop(0, `rgba(255, 255, 255, ${a * 0.22})`);
  innerGlow.addColorStop(0.48, `rgba(255, 255, 255, ${a * 0.08})`);
  innerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = innerGlow;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

  const rimLight = ctx.createRadialGradient(
    c - SPRITE_RADIUS * 0.34,
    c - SPRITE_RADIUS * 0.38,
    0,
    c - SPRITE_RADIUS * 0.24,
    c - SPRITE_RADIUS * 0.3,
    SPRITE_RADIUS * 0.4,
  );
  rimLight.addColorStop(0, `rgba(255, 255, 255, ${a * 0.24})`);
  rimLight.addColorStop(0.5, `rgba(255, 255, 255, ${a * 0.08})`);
  rimLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rimLight;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}
export function buildRenderClouds(clouds: Cloud[], buildSprite = buildPuffSprite): RenderCloud[] { const bobPeriods = [30, 20, 15, 12, 10] as const; const alphaPeriods = [20, 15, 12, 10] as const; const driftPeriods = [20, 15, 12] as const; return clouds.map((cloud) => { const depthSeed = Math.round(cloud.depth * 100); return { cloud, sizeScale: cloud.scale * (0.55 + cloud.depth * 0.45), parallax: 0.1 + cloud.depth * 1.4, bobPhase: 2 * Math.PI * cloud.depth * 13.7, bobPeriod: bobPeriods[depthSeed % bobPeriods.length], alphaPhase: 2 * Math.PI * cloud.depth * 7.3, alphaPeriod: alphaPeriods[depthSeed % alphaPeriods.length], puffs: cloud.puffs.map((puff, i): RenderPuff => { const puffSeed = depthSeed + i * 13; return { sprite: buildSprite(cloud, puff), puff, driftPhaseX: 2 * Math.PI * (cloud.depth * 15.7 + i * 9.7), driftPhaseY: 2 * Math.PI * (cloud.depth * 16.3 + i * 8.3), driftPeriodX: driftPeriods[puffSeed % driftPeriods.length], driftPeriodY: driftPeriods[(puffSeed + 1) % driftPeriods.length] }; }), }; }); }
export function buildBackground(width: number, height: number, stops: ReadonlyArray<{ t: number; color: string }>): HTMLCanvasElement { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); if (!ctx) return canvas; const sky = ctx.createLinearGradient(0, 0, 0, height); for (const stop of stops) sky.addColorStop(stop.t, stop.color); ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height); const haze = ctx.createLinearGradient(0, height * 0.7, 0, height); haze.addColorStop(0, 'rgba(255, 255, 255, 0)'); haze.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)'); haze.addColorStop(1, 'rgba(255, 255, 255, 0.7)'); ctx.fillStyle = haze; ctx.fillRect(0, height * 0.7, width, height * 0.3); return canvas; }
export function mulberry32(seed: number): () => number { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
