'use client';

import { useEffect, useRef } from 'react';

type Puff = { x: number; y: number; r: number; alpha: number };
type Cloud = {
  x: number;
  y: number;
  scale: number;
  depth: number; // 0 = farthest, 1 = nearest
  puffs: Puff[];
};

const CLOUDS: Cloud[] = [
  // Far band — small, high, cool, slow
  {
    x: 0.1,
    y: 0.6,
    scale: 0.4,
    depth: 0.12,
    puffs: [
      { x: -0.08, y: 0.0, r: 0.1, alpha: 0.7 },
      { x: 0.0, y: -0.02, r: 0.11, alpha: 0.75 },
      { x: 0.08, y: 0.02, r: 0.09, alpha: 0.7 },
    ],
  },
  {
    x: 0.35,
    y: 0.62,
    scale: 0.42,
    depth: 0.15,
    puffs: [
      { x: -0.09, y: 0.01, r: 0.1, alpha: 0.72 },
      { x: 0.0, y: -0.02, r: 0.11, alpha: 0.78 },
      { x: 0.09, y: 0.02, r: 0.1, alpha: 0.72 },
    ],
  },
  {
    x: 0.78,
    y: 0.66,
    scale: 0.45,
    depth: 0.2,
    puffs: [
      { x: -0.1, y: 0.02, r: 0.11, alpha: 0.75 },
      { x: 0.0, y: -0.02, r: 0.12, alpha: 0.8 },
      { x: 0.1, y: 0.02, r: 0.1, alpha: 0.75 },
    ],
  },
  // Far-mid band
  {
    x: 0.15,
    y: 0.9,
    scale: 0.65,
    depth: 0.35,
    puffs: [
      { x: -0.09, y: 0.02, r: 0.11, alpha: 0.92 },
      { x: -0.02, y: -0.02, r: 0.12, alpha: 0.95 },
      { x: 0.06, y: 0.0, r: 0.11, alpha: 0.95 },
      { x: 0.12, y: 0.04, r: 0.1, alpha: 0.9 },
      { x: 0.0, y: 0.06, r: 0.12, alpha: 0.92 },
    ],
  },
  {
    x: 0.55,
    y: 0.82,
    scale: 0.7,
    depth: 0.4,
    puffs: [
      { x: -0.1, y: 0.02, r: 0.12, alpha: 0.92 },
      { x: -0.02, y: -0.03, r: 0.13, alpha: 0.95 },
      { x: 0.06, y: 0.0, r: 0.12, alpha: 0.95 },
      { x: 0.13, y: 0.04, r: 0.11, alpha: 0.9 },
      { x: 0.0, y: 0.07, r: 0.13, alpha: 0.92 },
    ],
  },
  // Mid band
  {
    x: 0.28,
    y: 0.84,
    scale: 0.8,
    depth: 0.6,
    puffs: [
      { x: -0.1, y: 0.02, r: 0.13, alpha: 0.95 },
      { x: -0.02, y: -0.03, r: 0.14, alpha: 0.98 },
      { x: 0.06, y: 0.0, r: 0.13, alpha: 0.98 },
      { x: 0.13, y: 0.04, r: 0.12, alpha: 0.92 },
      { x: 0.0, y: 0.07, r: 0.14, alpha: 0.95 },
    ],
  },
  {
    x: 0.68,
    y: 0.86,
    scale: 0.85,
    depth: 0.55,
    puffs: [
      { x: -0.12, y: 0.03, r: 0.14, alpha: 0.95 },
      { x: -0.03, y: -0.02, r: 0.15, alpha: 0.98 },
      { x: 0.06, y: 0.01, r: 0.14, alpha: 0.98 },
      { x: 0.14, y: 0.05, r: 0.13, alpha: 0.92 },
      { x: 0.0, y: 0.08, r: 0.15, alpha: 0.95 },
    ],
  },
  // Near band — big, low, bright, fast
  {
    x: 0.45,
    y: 0.92,
    scale: 1.05,
    depth: 0.85,
    puffs: [
      { x: -0.18, y: 0.0, r: 0.16, alpha: 0.95 },
      { x: -0.08, y: -0.02, r: 0.15, alpha: 0.98 },
      { x: 0.02, y: 0.0, r: 0.16, alpha: 1 },
      { x: 0.12, y: 0.01, r: 0.15, alpha: 0.98 },
      { x: 0.22, y: 0.03, r: 0.14, alpha: 0.95 },
    ],
  },
  {
    x: 0.88,
    y: 0.8,
    scale: 1.15,
    depth: 0.95,
    puffs: [
      { x: -0.1, y: 0.05, r: 0.17, alpha: 1 },
      { x: -0.02, y: -0.02, r: 0.18, alpha: 1 },
      { x: 0.07, y: 0.02, r: 0.16, alpha: 1 },
      { x: 0.15, y: 0.06, r: 0.15, alpha: 0.98 },
      { x: 0.0, y: 0.09, r: 0.17, alpha: 0.98 },
      { x: -0.15, y: 0.09, r: 0.14, alpha: 0.95 },
    ],
  },
  {
    x: 0.08,
    y: 0.78,
    scale: 1.2,
    depth: 1.0,
    puffs: [
      { x: -0.12, y: 0.04, r: 0.2, alpha: 1 },
      { x: -0.04, y: -0.04, r: 0.18, alpha: 1 },
      { x: 0.05, y: 0.0, r: 0.17, alpha: 1 },
      { x: 0.13, y: 0.06, r: 0.15, alpha: 1 },
      { x: 0.0, y: 0.08, r: 0.19, alpha: 0.98 },
      { x: -0.08, y: 0.1, r: 0.16, alpha: 0.98 },
      { x: 0.18, y: 0.1, r: 0.14, alpha: 0.95 },
    ],
  },
];

// Draw far-to-near so near clouds overlap distant ones.
const CLOUDS_BY_DEPTH: Cloud[] = [...CLOUDS].sort(
  (a, b) => a.depth - b.depth,
);

// Sky tint that distant clouds blend toward (matches .sky-bg-test gradient).
const SKY_TINT = { r: 195, g: 223, b: 240 };

// Sky gradient stops (matches .webgl-background / .sky-bg-test CSS fallback).
const SKY_STOPS: ReadonlyArray<{ t: number; color: string }> = [
  { t: 0, color: '#b8dff0' },
  { t: 0.35, color: '#cce8f3' },
  { t: 0.65, color: '#e2f1f8' },
  { t: 1, color: '#f0f7fb' },
];

// --- Named constants for motion/effect features ---
const HUE_REBUILD_INTERVAL = 2;
const HUE_CYCLE_PERIOD = 180;
const HUE_AMPLITUDE_DEG = 8;
const HUE_TOP_SHIFT_FACTOR = 0.5;
const LIGHT_CYCLE_PERIOD = 120;
const LIGHT_ANGLE_SPEED = 0.012;
const LIGHT_HIGHLIGHT_AMP = 0.15;
const WIND_BASE_SPEED = 0.05;
const WRAP_MODULUS = 1.2;
const BOB_AMPLITUDE = 0.015;
const ALPHA_BREATH_AMP = 0.05;
const DRIFT_AMPLITUDE = 0.04;

// Reference radius for baked puff sprites. Sprites scale to on-screen size
// at draw time; clouds are soft so a moderate reference keeps memory low.
const SPRITE_RADIUS = 192;

// Gaussian blur baked into each sprite for soft, diffuse cloud edges.
// Applied once at build time (no per-frame cost). Padding keeps the blur
// from clipping at the sprite edge.
const SPRITE_BLUR = 14;
const SPRITE_PAD = SPRITE_BLUR * 2;
const SPRITE_SIZE = (SPRITE_RADIUS + SPRITE_PAD) * 2;
// Multiplier so the gradient radius maps to the on-screen draw radius while
// the blurred padding extends softly beyond it.
const SPRITE_SCALE = (SPRITE_RADIUS + SPRITE_PAD) / SPRITE_RADIUS;

// --- Hue-shift helpers (feature 4) ---
function parseHex(hex: string): { r: number; g: number; b: number } {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return { h: 0, s: 0, l };
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = 0;
  if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
}
function hslToRgb(h: number, s: number, l: number) {
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}
function shiftHueColor(hex: string, deltaDeg: number): string {
  const { r, g, b } = parseHex(hex);
  const hsl = rgbToHsl(r, g, b);
  hsl.h = ((hsl.h + deltaDeg / 360) % 1 + 1) % 1;
  const c = hslToRgb(hsl.h, hsl.s, hsl.l);
  return `#${((1 << 24) | (c.r << 16) | (c.g << 8) | c.b).toString(16).slice(1)}`;
}

type RenderPuff = {
  sprite: HTMLCanvasElement;
  puff: Puff;
  driftPhaseX: number;
  driftPhaseY: number;
  driftPeriodX: number;
  driftPeriodY: number;
};
type RenderCloud = {
  cloud: Cloud;
  puffs: RenderPuff[];
  sizeScale: number;
  parallax: number;
  bobPhase: number;
  bobPeriod: number;
  alphaPhase: number;
  alphaPeriod: number;
};

// Pre-render each puff's radial gradient to an offscreen sprite once.
// Appearance (tint / alpha / fade) is fully derived from cloud depth and is
// static, so baking it avoids re-creating ~50 gradients every frame.
function buildPuffSprite(
  cloud: Cloud,
  puff: Puff,
  highlightOffsetX = 0,
  highlightOffsetY = 0,
): HTMLCanvasElement {
  const depth = cloud.depth;
  const r = Math.round(SKY_TINT.r + (255 - SKY_TINT.r) * depth);
  const g = Math.round(SKY_TINT.g + (255 - SKY_TINT.g) * depth);
  const b = Math.round(SKY_TINT.b + (255 - SKY_TINT.b) * depth);
  const alphaMul = 0.5 + depth * 0.5;
  const a = puff.alpha * alphaMul;
  const fadeStart = 0.4 + depth * 0.2;
  const fadeMid = 0.78 + depth * 0.1;
  const midAlpha = 0.6 - depth * 0.15;

  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const c = SPRITE_SIZE / 2;
  // Inner highlight: base at (c, c - 0.2*R) with animated drift (feature 3b).
  const gradient = ctx.createRadialGradient(
    c + highlightOffsetX,
    c - SPRITE_RADIUS * 0.2 + highlightOffsetY,
    0,
    c,
    c,
    SPRITE_RADIUS,
  );
  // Gentle multi-stop falloff with an extended tail so edges dissolve into
  // the sky instead of cutting off as a hard ring.
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
  gradient.addColorStop(fadeStart, `rgba(${r}, ${g}, ${b}, ${a * 0.9})`);
  gradient.addColorStop(fadeMid, `rgba(${r}, ${g}, ${b}, ${a * midAlpha})`);
  gradient.addColorStop(0.92, `rgba(${r}, ${g}, ${b}, ${a * midAlpha * 0.3})`);
  gradient.addColorStop(
    1,
    `rgba(${SKY_TINT.r}, ${SKY_TINT.g}, ${SKY_TINT.b}, 0)`,
  );

  // Bake a gaussian blur into the sprite for soft, diffuse edges. One-time
  // cost; the per-frame loop only drawImages the pre-blurred sprite.
  ctx.filter = `blur(${SPRITE_BLUR}px)`;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  ctx.filter = 'none';
  return canvas;
}

function buildRenderClouds(): RenderCloud[] {
  return CLOUDS_BY_DEPTH.map((cloud) => {
    const depthSeed = Math.round(cloud.depth * 100);
    return {
      cloud,
      sizeScale: cloud.scale * (0.55 + cloud.depth * 0.45),
      parallax: 0.2 + cloud.depth * 0.8,
      // Feature 1: vertical bobbing phase/period (deterministic from depth)
      bobPhase: 2 * Math.PI * cloud.depth * 13.7,
      bobPeriod: 18 + (depthSeed * 7) % 13,
      // Feature 3a: breathing alpha phase/period (deterministic from depth)
      alphaPhase: 2 * Math.PI * cloud.depth * 7.3,
      alphaPeriod: 8 + (depthSeed * 11) % 8,
      puffs: cloud.puffs.map((puff, i) => {
        const puffSeed = depthSeed + i * 13;
        return {
          sprite: buildPuffSprite(cloud, puff),
          puff,
          // Feature 2: per-puff drift parameters (deterministic from depth + index)
          driftPhaseX: 2 * Math.PI * (cloud.depth * 15.7 + i * 9.7),
          driftPhaseY: 2 * Math.PI * (cloud.depth * 16.3 + i * 8.3),
          driftPeriodX: 12 + (puffSeed * 17) % 14,
          driftPeriodY: 12 + (puffSeed * 19) % 14,
        };
      }),
    };
  });
}

// Bake the static sky gradient + horizon haze to an offscreen canvas so the
// per-frame loop only needs one drawImage for the whole backdrop.
function buildBackground(
  width: number,
  height: number,
  stops: ReadonlyArray<{ t: number; color: string }> = SKY_STOPS,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  for (const stop of stops) sky.addColorStop(stop.t, stop.color);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const haze = ctx.createLinearGradient(0, height * 0.7, 0, height);
  haze.addColorStop(0, 'rgba(255, 255, 255, 0)');
  haze.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
  haze.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  return canvas;
}

export default function SkyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Sprites are pure data -> build once for the component's lifetime.
    const renderClouds = buildRenderClouds();
    let bgCanvas: HTMLCanvasElement | null = null;
    let rafId = 0;
    let startTime = 0;
    let lastDrawTime = 0;
    // Feature 4: hue drift rebuild state (mutable copy of stops)
    const currentStops = SKY_STOPS.map((s) => ({ ...s }));
    let lastHueRebuild = 0;
    // Feature 3b: light shift rebuild state
    let lastLightCycle = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      bgCanvas = buildBackground(w, h, currentStops);
    };

    const drawScene = (elapsed: number) => {
      if (!bgCanvas) return;
      const { width, height } = canvas;
      const baseSize = Math.min(width, height);

      // --- Feature 4: Time-of-day hue drift (rebuild bg every 2s) ---
      if (!prefersReduced && elapsed - lastHueRebuild >= HUE_REBUILD_INTERVAL) {
        const hueDelta = HUE_AMPLITUDE_DEG * Math.sin(2 * Math.PI * elapsed / HUE_CYCLE_PERIOD);
        for (let i = 0; i < currentStops.length; i++) {
          const stopFactor = 1 - currentStops[i].t * HUE_TOP_SHIFT_FACTOR;
          currentStops[i] = {
            t: currentStops[i].t,
            color: shiftHueColor(SKY_STOPS[i].color, hueDelta * stopFactor),
          };
        }
        bgCanvas = buildBackground(width, height, currentStops);
        lastHueRebuild = elapsed;
      }

      // --- Feature 3b: Light shift (rebuild sprites every 120s) ---
      if (!prefersReduced && elapsed - lastLightCycle >= LIGHT_CYCLE_PERIOD) {
        const hlAngle = elapsed * LIGHT_ANGLE_SPEED;
        const hlX = SPRITE_RADIUS * LIGHT_HIGHLIGHT_AMP * Math.sin(hlAngle);
        const hlY = SPRITE_RADIUS * LIGHT_HIGHLIGHT_AMP * Math.cos(hlAngle * 0.8);
        for (const rc of renderClouds) {
          for (const rp of rc.puffs) {
            rp.sprite = buildPuffSprite(rc.cloud, rp.puff, hlX, hlY);
          }
        }
        lastLightCycle = elapsed;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bgCanvas, 0, 0);

      // Feature 5 SKIPPED — no wind gust modulation, constant base speed.
      const offset = (elapsed * WIND_BASE_SPEED) % WRAP_MODULUS;

      for (const rc of renderClouds) {
        const { cloud, puffs, sizeScale, parallax, bobPhase, bobPeriod, alphaPhase, alphaPeriod } = rc;
        const animatedX = (cloud.x + offset * parallax) % WRAP_MODULUS;
        const cx = animatedX * width;

        // --- Feature 1: Vertical bobbing (±1.5% vh, period 18-30s) ---
        let bobOffset = 0;
        if (!prefersReduced) {
          bobOffset = BOB_AMPLITUDE * height * Math.sin(2 * Math.PI * elapsed / bobPeriod + bobPhase);
        }
        const cy = cloud.y * height + bobOffset;

        // --- Feature 3a: Breathing alpha (±5%, per cloud, period 8-15s) ---
        let alphaMul = 1;
        if (!prefersReduced) {
          alphaMul = 1 + ALPHA_BREATH_AMP * Math.sin(2 * Math.PI * elapsed / alphaPeriod + alphaPhase);
        }

        const drawPuffs = (originX: number) => {
          for (let pi = 0; pi < puffs.length; pi++) {
            const rp = puffs[pi];
            const { sprite, puff, driftPhaseX, driftPhaseY, driftPeriodX, driftPeriodY } = rp;

            // --- Feature 2: Cloud shape evolution (per-puff drift, ±0.04, 12-25s) ---
            let driftX = 0, driftY = 0;
            if (!prefersReduced) {
              driftX = DRIFT_AMPLITUDE * Math.sin(2 * Math.PI * elapsed / driftPeriodX + driftPhaseX);
              driftY = DRIFT_AMPLITUDE * Math.sin(2 * Math.PI * elapsed / driftPeriodY + driftPhaseY);
            }

            const px = originX + (puff.x + driftX) * baseSize * sizeScale;
            const py = cy + (puff.y + driftY) * baseSize * sizeScale;
            const drawR = puff.r * baseSize * sizeScale;
            const drawHalf = drawR * SPRITE_SCALE;

            ctx.drawImage(
              sprite,
              px - drawHalf,
              py - drawHalf,
              drawHalf * 2,
              drawHalf * 2,
            );
          }
        };

        if (alphaMul !== 1) ctx.globalAlpha = alphaMul;
        drawPuffs(cx);
        if (alphaMul !== 1) ctx.globalAlpha = 1;
        if (animatedX > 1.0) {
          if (alphaMul !== 1) ctx.globalAlpha = alphaMul;
          drawPuffs((animatedX - WRAP_MODULUS) * width);
          if (alphaMul !== 1) ctx.globalAlpha = 1;
        }
      }
      ctx.globalAlpha = 1; // safety reset
    };

    const animate = (time: number) => {
      rafId = window.requestAnimationFrame(animate);
      if (!startTime) startTime = time;
      if (time - lastDrawTime < 1000 / 30) return;
      lastDrawTime = time;
      const elapsed = (time - startTime) / 1000;
      drawScene(elapsed);
    };

    const start = () => {
      if (rafId) return;
      lastDrawTime = 0;
      lastHueRebuild = 0;
      lastLightCycle = 0;
      rafId = window.requestAnimationFrame(animate);
    };
    const stop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    drawScene(0);

    if (!prefersReduced) {
      start();
      document.addEventListener('visibilitychange', onVisibility);
    }
    window.addEventListener('resize', resize);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="sky-background__canvas"
      aria-hidden="true"
    />
  );
}
