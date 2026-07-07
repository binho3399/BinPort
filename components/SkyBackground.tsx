'use client';

import { useEffect, useRef } from 'react';
import { CLOUDS_BY_DEPTH, MOBILE_CLOUDS_BY_DEPTH, SKY_STOPS } from './sky/cloudData';
import {
  ALPHA_BREATH_AMP,
  ALPHA_BREATH_AMP_VIVID,
  BOB_AMPLITUDE,
  BOB_AMPLITUDE_VIVID,
  DRIFT_AMPLITUDE,
  DRIFT_AMPLITUDE_VIVID,
  GUST_AMP,
  GUST_PERIOD,
  HUE_CYCLE_PERIOD,
  HUE_CYCLE_PERIOD_VIVID,
  PARALLAX_X_AMP,
  PARALLAX_Y_AMP,
  SPRITE_SCALE,
  WIND_BASE_SPEED,
  WRAP_MODULUS,
} from './sky/constants';
import { buildBackground, buildRenderClouds, mulberry32 } from './sky/sprites';
import { buildBirds, drawBirdSilhouette } from './sky/birds';
import type { Bird } from './sky/birds';
import { buildSunGlowCanvas, drawSunGlow } from './sky/sunGlow';
import { skyTransition } from '../lib/skyTransition';

export default function SkyBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vivid = true;
    let renderClouds = buildRenderClouds(CLOUDS_BY_DEPTH);
    let usingMobileClouds = false;
    let bgCanvas: HTMLCanvasElement | null = null;
    let rafId = 0;
    let startTime = 0;
    let lastDrawTime = 0;
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    let haloCanvas: HTMLCanvasElement | null = null;
    let particles: Bird[] | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const shouldUseMobileClouds = window.innerWidth <= 768;
      if (shouldUseMobileClouds !== usingMobileClouds) {
        renderClouds = buildRenderClouds(shouldUseMobileClouds ? MOBILE_CLOUDS_BY_DEPTH : CLOUDS_BY_DEPTH);
        usingMobileClouds = shouldUseMobileClouds;
      }
      bgCanvas = buildBackground(w, h, SKY_STOPS);
      if (vivid) {
        haloCanvas = buildSunGlowCanvas(w, h);
        if (!particles) {
          const rng = mulberry32(1337);
          const count = window.innerWidth <= 768 ? 12 : 25;
          particles = buildBirds(rng, count);
        }
      }
    };

    const drawScene = (elapsed: number) => {
      if (!bgCanvas) return;
      const { width, height } = canvas;
      const ascend = skyTransition.ascend;
      const baseSize = Math.min(width, height);
      ctx.clearRect(0, 0, width, height);
      if (!prefersReduced) {
        const hueDelta = 0.5 * Math.sin(2 * Math.PI * elapsed / (vivid ? HUE_CYCLE_PERIOD_VIVID : HUE_CYCLE_PERIOD));
        ctx.filter = `hue-rotate(${hueDelta * 10}deg)`;
      }
      ctx.drawImage(bgCanvas, 0, 0);
      ctx.filter = 'none';
      if (vivid) {
        pointerX += (targetX - pointerX) * 0.05;
        pointerY += (targetY - pointerY) * 0.05;
        drawSunGlow(ctx, haloCanvas, elapsed);
      }
      const gust = vivid ? GUST_AMP * Math.sin(2 * Math.PI * elapsed / GUST_PERIOD) : 0;
      const offset = (elapsed * (WIND_BASE_SPEED + gust)) % WRAP_MODULUS;
      for (const rc of renderClouds) {
        const { cloud, puffs, sizeScale, parallax, bobPhase, bobPeriod, alphaPhase, alphaPeriod } = rc;
        const animatedX = (cloud.x + offset * parallax) % WRAP_MODULUS;
        let cx = animatedX * width;
        let bobOffset = 0;
        if (!prefersReduced) bobOffset = (vivid ? BOB_AMPLITUDE_VIVID : BOB_AMPLITUDE) * height * Math.sin(2 * Math.PI * elapsed / bobPeriod + bobPhase);
        let cy = cloud.y * height + bobOffset;
        // Parallax ascend: near clouds (high rc.parallax) rush down faster
        if (ascend > 0.001) {
          cy += ascend * rc.parallax * height * 0.45;
        }
        if (vivid) { cx += pointerX * width * PARALLAX_X_AMP * parallax; cy += pointerY * height * PARALLAX_Y_AMP * parallax; }
        let alphaMul = 1;
        if (!prefersReduced) alphaMul = 1 + (vivid ? ALPHA_BREATH_AMP_VIVID : ALPHA_BREATH_AMP) * Math.sin(2 * Math.PI * elapsed / alphaPeriod + alphaPhase);
        const drawPuffs = (originX: number) => {
          for (const rp of puffs) {
            const { sprite, puff, driftPhaseY, driftPeriodY } = rp;
            let driftY = 0;
            if (!prefersReduced) driftY = (vivid ? DRIFT_AMPLITUDE_VIVID : DRIFT_AMPLITUDE) * Math.sin(2 * Math.PI * elapsed / driftPeriodY + driftPhaseY);
            const px = originX + puff.x * baseSize * sizeScale;
            const py = cy + (puff.y + driftY) * baseSize * sizeScale;
            const drawR = puff.r * baseSize * sizeScale;
            const drawHalf = drawR * SPRITE_SCALE;
            ctx.drawImage(sprite, px - drawHalf, py - drawHalf, drawHalf * 2, drawHalf * 2);
          }
        };
        if (alphaMul !== 1) ctx.globalAlpha = alphaMul;
        drawPuffs(cx); drawPuffs(cx - WRAP_MODULUS * width);
        if (alphaMul !== 1) ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = 1;
      if (vivid && particles) {
        drawBirdSilhouette(ctx, particles, width, height, elapsed, offset, ascend);
      }
      if (ascend > 0.01 && !prefersReduced) {
        ctx.globalAlpha = ascend * 0.55;
        ctx.fillStyle = '#e8f1fa';
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      }
    };

    const animate = (time: number) => { rafId = window.requestAnimationFrame(animate); if (!startTime) startTime = time; if (time - lastDrawTime < 1000 / 30) return; lastDrawTime = time; drawScene((time - startTime) / 1000); };
    const start = () => { if (rafId) return; lastDrawTime = 0; rafId = window.requestAnimationFrame(animate); };
    const stop = () => { if (rafId) { window.cancelAnimationFrame(rafId); rafId = 0; } };
    const onPointerMove = (event: PointerEvent) => { if (event.pointerType === 'touch') return; targetX = (event.clientX / window.innerWidth) * 2 - 1; targetY = (event.clientY / window.innerHeight) * 2 - 1; };
    const onPointerClear = () => { targetX = 0; targetY = 0; };
    const onVisibility = () => { if (document.hidden) stop(); else start(); };

    resize();
    drawScene(0);
    if (!prefersReduced) { start(); document.addEventListener('visibilitychange', onVisibility); }
    window.addEventListener('resize', resize);
    if (vivid) { window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerleave', onPointerClear); window.addEventListener('blur', onPointerClear); }
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('resize', resize); if (vivid) { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerleave', onPointerClear); window.removeEventListener('blur', onPointerClear); } };
  }, []);

  return <canvas ref={canvasRef} className="sky-background__canvas" aria-hidden="true" />;
}
