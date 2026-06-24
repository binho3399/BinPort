import { profile } from '../lib/siteContent';
import { drawTrackedText } from './webgl/canvasText';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>-_[]{}';

export const PROFILE_LABELS = profile.profileLabels;
export const PROFILE_CYCLE_DURATION = 3.65;
export const PROFILE_TRANSITION_DURATION = 1.25;
export const PROFILE_HOLD_DURATION = PROFILE_CYCLE_DURATION - PROFILE_TRANSITION_DURATION;
export const PROFILE_INITIAL_TIME = 0;

function runtimeNow() {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function scrambleChar(seed) {
  const index =
    Math.abs(Math.floor(10000 * Math.sin(999.13 * seed + 0.04 * runtimeNow()))) %
    SCRAMBLE_CHARS.length;
  return SCRAMBLE_CHARS[index];
}

function tweenScramble({ currentText, nextText, progress, seed }) {
  const length = Math.max(currentText.length, nextText.length);
  const current = currentText.padEnd(length, ' ');
  const next = nextText.padEnd(length, ' ');
  const nextLength = nextText.trimEnd().length;
  const revealProgress = progress <= 0.448 ? 0 : 1 - Math.pow(1 - (progress - 0.448) / 0.552, 3);
  const revealCount = Math.floor(length * (progress < 1 ? revealProgress : 1));

  return Array.from({ length }, (_, index) => {
    if (index >= nextLength) return ' ';
    if (progress >= 1 || index < revealCount) return next[index];
    if (progress < 0.448) {
      if (current[index] === ' ') return ' ';
      const chance =
        Math.abs(10000 * Math.sin(127.1 * (seed + 19 * index + Math.floor(18 * runtimeNow())))) % 1;
      return chance < 0.18 + 0.42 * (progress / 0.448)
        ? scrambleChar(seed + 13 * index)
        : current[index];
    }
    if (next[index] === ' ' && current[index] === ' ') return ' ';
    return scrambleChar(seed + 13 * index);
  })
    .join('')
    .trimEnd();
}

export function scrambleText(currentText, nextText, progress, seed) {
  return tweenScramble({ currentText, nextText, progress, seed });
}

export function getProfileTextFrame(time) {
  const step = Math.floor(time / PROFILE_CYCLE_DURATION);
  const cycleTime = time % PROFILE_CYCLE_DURATION;
  const progress =
    cycleTime < PROFILE_HOLD_DURATION
      ? 0
      : Math.min((cycleTime - PROFILE_HOLD_DURATION) / PROFILE_TRANSITION_DURATION, 1);
  const currentText = PROFILE_LABELS[step % PROFILE_LABELS.length];
  const nextText = PROFILE_LABELS[(step + 1) % PROFILE_LABELS.length];
  const renderedText =
    progress <= 0 ? currentText : scrambleText(currentText, nextText, progress, 47 * step + 9);

  return { time, step, cycleTime, progress, currentText, nextText, renderedText };
}

export function drawProfileTexture(ctx, canvas, time) {
  const frame = getProfileTextFrame(time);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffdf0e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTrackedText(ctx, frame.renderedText, {
    x: canvas.width / 2,
    y: 512,
    font: '500 152px/1 gazzetta-variable, sans-serif',
    color: '#000000',
    maxWidth: canvas.width * 0.82,
  });

  return frame;
}

export function createProfileCanvas(width = 1024, height = 1024, time = PROFILE_INITIAL_TIME) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const frame = drawProfileTexture(ctx, canvas, time);

  return { canvas, ctx, frame };
}
