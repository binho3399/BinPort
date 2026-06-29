'use client';

import { useEffect, useRef } from 'react';

type Puff = { x: number; y: number; r: number; alpha: number };
type Cloud = { x: number; y: number; scale: number; puffs: Puff[] };

const CLOUDS: Cloud[] = [
  {
    x: 0.08,
    y: 0.78,
    scale: 1,
    puffs: [
      { x: -0.12, y: 0.04, r: 0.16, alpha: 0.95 },
      { x: -0.04, y: -0.04, r: 0.14, alpha: 1 },
      { x: 0.05, y: 0.0, r: 0.13, alpha: 0.95 },
      { x: 0.13, y: 0.06, r: 0.11, alpha: 0.9 },
      { x: 0.0, y: 0.08, r: 0.15, alpha: 0.85 },
      { x: -0.08, y: 0.1, r: 0.12, alpha: 0.85 },
      { x: 0.18, y: 0.1, r: 0.1, alpha: 0.8 },
    ],
  },
  {
    x: 0.88,
    y: 0.8,
    scale: 0.95,
    puffs: [
      { x: -0.1, y: 0.05, r: 0.13, alpha: 0.9 },
      { x: -0.02, y: -0.02, r: 0.14, alpha: 1 },
      { x: 0.07, y: 0.02, r: 0.12, alpha: 0.95 },
      { x: 0.15, y: 0.06, r: 0.11, alpha: 0.85 },
      { x: 0.0, y: 0.09, r: 0.13, alpha: 0.85 },
      { x: -0.15, y: 0.09, r: 0.1, alpha: 0.8 },
    ],
  },
  {
    x: 0.45,
    y: 0.92,
    scale: 0.85,
    puffs: [
      { x: -0.18, y: 0.0, r: 0.12, alpha: 0.7 },
      { x: -0.08, y: -0.02, r: 0.11, alpha: 0.75 },
      { x: 0.02, y: 0.0, r: 0.12, alpha: 0.8 },
      { x: 0.12, y: 0.01, r: 0.11, alpha: 0.75 },
      { x: 0.22, y: 0.03, r: 0.1, alpha: 0.7 },
    ],
  },
];

function drawCloud(
  ctx: CanvasRenderingContext2D,
  cloud: Cloud,
  width: number,
  height: number,
  offset: number,
) {
  const baseSize = Math.min(width, height);
  const animatedX = (cloud.x + offset * cloud.scale) % 1.2;
  const cx = animatedX * width;
  const cy = cloud.y * height;

  for (const puff of cloud.puffs) {
    const px = cx + puff.x * baseSize * cloud.scale;
    const py = cy + puff.y * baseSize * cloud.scale;
    const radius = puff.r * baseSize * cloud.scale;

    const gradient = ctx.createRadialGradient(
      px,
      py - radius * 0.2,
      0,
      px,
      py,
      radius,
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${puff.alpha})`);
    gradient.addColorStop(0.4, `rgba(255, 255, 255, ${puff.alpha * 0.75})`);
    gradient.addColorStop(0.75, `rgba(245, 250, 255, ${puff.alpha * 0.25})`);
    gradient.addColorStop(1, 'rgba(220, 235, 250, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (animatedX > 1.0) {
    const wrapCx = (animatedX - 1.2) * width;
    for (const puff of cloud.puffs) {
      const px = wrapCx + puff.x * baseSize * cloud.scale;
      const py = cy + puff.y * baseSize * cloud.scale;
      const radius = puff.r * baseSize * cloud.scale;

      const gradient = ctx.createRadialGradient(
        px,
        py - radius * 0.2,
        0,
        px,
        py,
        radius,
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${puff.alpha})`);
      gradient.addColorStop(0.4, `rgba(255, 255, 255, ${puff.alpha * 0.75})`);
      gradient.addColorStop(0.75, `rgba(245, 250, 255, ${puff.alpha * 0.25})`);
      gradient.addColorStop(1, 'rgba(220, 235, 250, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawHazeLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const haze = ctx.createLinearGradient(0, height * 0.7, 0, height);
  haze.addColorStop(0, 'rgba(255, 255, 255, 0)');
  haze.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
  haze.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);
}

function drawScene(canvas: HTMLCanvasElement, offset: number = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  drawHazeLayer(ctx, width, height);

  for (const cloud of CLOUDS) {
    drawCloud(ctx, cloud, width, height, offset);
  }
}

export default function SkyBgTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const animate = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = (time - startTimeRef.current) / 1000;
      const offset = (elapsed * 0.015) % 1.2;

      drawScene(canvas, offset);
      rafRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <main className="sky-bg-test">
      <canvas
        ref={canvasRef}
        className="sky-bg-test__clouds"
        aria-hidden="true"
      />
    </main>
  );
}
