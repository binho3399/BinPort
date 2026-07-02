import * as THREE from 'three';
import { webglText } from '../../lib/siteContent';
import { scrambleText } from '../profileSignCanvas';
import { drawTrackedText } from './canvasText';
import type { AnimatedCanvasTexture } from './types';

export function makeAnimatedCanvasTexture(
  width = 768,
  height = 768,
): AnimatedCanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return { canvas, ctx, texture };
}

export function drawContactTexture(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  time: number,
) {
  const scale = canvas.width / 1024;
  const step = Math.floor(time / 3.65);
  const progress = Math.min((time % 3.65) / 1.25, 1);
  const currentText = webglText.contactLabels[step % webglText.contactLabels.length];
  const nextText = webglText.contactLabels[(step + 1) % webglText.contactLabels.length];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTrackedText(ctx, scrambleText(currentText, nextText, progress, 53 * step + 21), {
    x: canvas.width / 2,
    y: 360 * scale,
    font: `700 ${172 * scale}px/1 helvetica-neue-lt-pro, sans-serif`,
    color: '#0047bd',
    maxWidth: canvas.width * 0.8,
  });
  ctx.fillStyle = '#0047bd';
  const patternWidth = 560 * scale;
  const patternTravel = 118 * scale;
  for (
    let x = -patternWidth - ((patternTravel * time) % patternWidth);
    x < canvas.width + patternWidth;
    x += patternWidth
  ) {
    ctx.beginPath();
    ctx.moveTo(x, 664 * scale);
    ctx.lineTo(x + 160 * scale, 552 * scale);
    ctx.lineTo(x + 160 * scale, 628 * scale);
    ctx.lineTo(x + 530 * scale, 628 * scale);
    ctx.lineTo(x + 530 * scale, 700 * scale);
    ctx.lineTo(x + 160 * scale, 700 * scale);
    ctx.lineTo(x + 160 * scale, 776 * scale);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawProjectsTexture(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  offset: number,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#133afd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '400 72px/1 helvetica-neue-lt-pro, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f7f5ef';
  const width = Math.max(ctx.measureText(webglText.projectsMarquee).width, 1);
  for (let x = -offset; x < canvas.width + width; x += width) {
    ctx.fillText(webglText.projectsMarquee, x, canvas.height / 2);
  }
  return width;
}

export function makeVideoTexture(src: string): THREE.VideoTexture | null {
  if (typeof document === 'undefined') return null;
  const video = document.createElement('video');
  video.src = src;
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.play().catch(() => {});

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function tryCreateShowreelVideoTexture() {
  return makeVideoTexture('/videos/hirotos_showreel.mp4');
}

export function makeShowreelTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
  gradient.addColorStop(0, '#c8f7fb');
  gradient.addColorStop(0.52, '#f7f0c4');
  gradient.addColorStop(1, '#587f65');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.fillStyle = 'rgba(255, 244, 177, 0.55)';
  ctx.fillRect(0, 615, 1024, 270);
  ctx.strokeStyle = '#9c463f';
  ctx.lineWidth = 42;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(120, 385);
  ctx.bezierCurveTo(350, 225, 620, 270, 880, 155);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
