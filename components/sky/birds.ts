export type Bird = {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  speedMul: number;
  bobPhase: number;
  bobPeriod: number;
  flapPhase: number;
  flapPeriod: number;
};

export function buildBirds(rng: () => number, count: number): Bird[] {
  return Array.from({ length: count }, () => ({
    x: rng(),
    y: 0.08 + rng() * 0.32,
    scale: 1 + rng() * 1.2,
    alpha: 0.28 + rng() * 0.24,
    speedMul: 0.35 + rng() * 0.45,
    bobPhase: rng() * 2 * Math.PI,
    bobPeriod: [15, 12, 10][Math.floor(rng() * 3)],
    flapPhase: rng() * 2 * Math.PI,
    flapPeriod: [2, 2.5, 3][Math.floor(rng() * 3)],
  }));
}

export function drawBirdSilhouette(
  ctx: CanvasRenderingContext2D,
  birds: Bird[],
  width: number,
  height: number,
  elapsed: number,
  offset: number,
  ascend = 0,
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const bird of birds) {
    const normX = (bird.x + offset * bird.speedMul * 0.22) % 1.2;
    const wrapProgress = normX / 1.2;
    const fadeInWindow = 0.15;
    const fadeOutWindow = 0.45;
    const tIn  = Math.min(1, Math.max(0, wrapProgress / fadeInWindow));
    const tOut = Math.min(1, Math.max(0, (1 - wrapProgress) / fadeOutWindow));
    const fadeIn  = 1 - (1 - tIn) * (1 - tIn);   // easeOutQuad
    const fadeOut = 1 - (1 - tOut) * (1 - tOut);  // easeOutQuad — gentle tail, no harsh cutoff
    const wrapFade = Math.min(fadeIn, fadeOut);
    let px = normX * width;
    if (px > width) px -= width * 1.2;
    if (px < -24 || px > width + 24) continue;

    const py =
      bird.y * height +
      Math.sin((2 * Math.PI * elapsed) / bird.bobPeriod + bird.bobPhase) * 4;
    const flap = Math.sin((2 * Math.PI * elapsed) / bird.flapPeriod + bird.flapPhase);
    const wingSpan = 9 * bird.scale;
    const wingLift = (3 + flap * 3.1) * bird.scale;

    ctx.strokeStyle = `rgba(78, 86, 96, ${bird.alpha * wrapFade * (1 - ascend)})`;
    ctx.lineWidth = Math.max(1.2, 1.35 * bird.scale);
    ctx.beginPath();
    ctx.moveTo(px - wingSpan, py + wingLift * 0.35);
    ctx.quadraticCurveTo(px - wingSpan * 0.45, py - wingLift, px, py);
    ctx.quadraticCurveTo(px + wingSpan * 0.45, py - wingLift, px + wingSpan, py + wingLift * 0.35);
    ctx.stroke();
  }

  ctx.restore();
}
