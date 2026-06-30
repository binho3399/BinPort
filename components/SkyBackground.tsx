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

// Reference radius for baked puff sprites. Sprites scale to on-screen size
// at draw time; clouds are soft so a moderate reference keeps memory low.
const SPRITE_RADIUS = 192;

// Gaussian blur baked into each sprite for soft, diffuse cloud edges.
// Applied once at build time (no per-frame cost). Padding keeps the blur
// from clipping at the sprite edge.
const SPRITE_BLUR = 14;
const SPRITE_PAD = 28;
const SPRITE_SIZE = (SPRITE_RADIUS + SPRITE_PAD) * 2;
// Multiplier so the gradient radius maps to the on-screen draw radius while
// the blurred padding extends softly beyond it.
const SPRITE_SCALE = (SPRITE_RADIUS + SPRITE_PAD) / SPRITE_RADIUS;

type RenderPuff = { sprite: HTMLCanvasElement; puff: Puff };
type RenderCloud = {
  cloud: Cloud;
  puffs: RenderPuff[];
  sizeScale: number;
  parallax: number;
};

// Pre-render each puff's radial gradient to an offscreen sprite once.
// Appearance (tint / alpha / fade) is fully derived from cloud depth and is
// static, so baking it avoids re-creating ~50 gradients every frame.
function buildPuffSprite(cloud: Cloud, puff: Puff): HTMLCanvasElement {
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
  // Inner highlight sits 0.2*R above center, matching the original gradient.
  const gradient = ctx.createRadialGradient(
    c,
    c - SPRITE_RADIUS * 0.2,
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
  return CLOUDS_BY_DEPTH.map((cloud) => ({
    cloud,
    sizeScale: cloud.scale * (0.55 + cloud.depth * 0.45),
    parallax: 0.2 + cloud.depth * 0.8,
    puffs: cloud.puffs.map((puff) => ({
      sprite: buildPuffSprite(cloud, puff),
      puff,
    })),
  }));
}

// Bake the static sky gradient + horizon haze to an offscreen canvas so the
// per-frame loop only needs one drawImage for the whole backdrop.
function buildBackground(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  for (const stop of SKY_STOPS) sky.addColorStop(stop.t, stop.color);
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

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      bgCanvas = buildBackground(w, h);
    };

    const drawScene = (offset: number) => {
      if (!bgCanvas) return;
      const { width, height } = canvas;
      const baseSize = Math.min(width, height);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bgCanvas, 0, 0);

      for (const rc of renderClouds) {
        const { cloud, puffs, sizeScale, parallax } = rc;
        const animatedX = (cloud.x + offset * parallax) % 1.2;
        const cx = animatedX * width;
        const cy = cloud.y * height;

        const drawPuffs = (originX: number) => {
          for (const { sprite, puff } of puffs) {
            const px = originX + puff.x * baseSize * sizeScale;
            const py = cy + puff.y * baseSize * sizeScale;
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

        drawPuffs(cx);
        if (animatedX > 1.0) {
          drawPuffs((animatedX - 1.2) * width);
        }
      }
    };

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;
      const offset = (elapsed * 0.015) % 1.2;
      drawScene(offset);
      rafId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (rafId) return;
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
