import * as THREE from 'three';
import { scrambleText } from '../profileSignCanvas';
import { drawTrackedText } from './canvasText';

const CONTACT_LABELS = ['コンタクト', 'CONTACT'];
const PROJECTS_TEXT = 'PROJECTS ARCHIVE / PROJECTS ARCHIVE / PROJECTS ARCHIVE / ';

export function makeAnimatedCanvasTexture(width = 1024, height = 1024) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { canvas, ctx, texture };
}

export function drawContactTexture(ctx, canvas, time) {
  const step = Math.floor(time / 3.65);
  const progress = Math.min((time % 3.65) / 1.25, 1);
  const currentText = CONTACT_LABELS[step % CONTACT_LABELS.length];
  const nextText = CONTACT_LABELS[(step + 1) % CONTACT_LABELS.length];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTrackedText(ctx, scrambleText(currentText, nextText, progress, 53 * step + 21), {
    x: canvas.width / 2,
    y: 360,
    font: '700 172px/1 helvetica-neue-lt-pro, sans-serif',
    color: '#0047bd',
  });
  ctx.fillStyle = '#0047bd';
  for (let x = -560 - ((118 * time) % 560); x < 1584; x += 560) {
    ctx.beginPath();
    ctx.moveTo(x, 664);
    ctx.lineTo(x + 160, 552);
    ctx.lineTo(x + 160, 628);
    ctx.lineTo(x + 530, 628);
    ctx.lineTo(x + 530, 700);
    ctx.lineTo(x + 160, 700);
    ctx.lineTo(x + 160, 776);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawProjectsTexture(ctx, canvas, offset) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#133afd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '400 72px/1 helvetica-neue-lt-pro, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f7f5ef';
  const width = Math.max(ctx.measureText(PROJECTS_TEXT).width, 1);
  for (let x = -offset; x < canvas.width + width; x += width) {
    ctx.fillText(PROJECTS_TEXT, x, canvas.height / 2);
  }
  return width;
}

export function makeVideoTexture(src) {
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

export function makeShowreelTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

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
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}
