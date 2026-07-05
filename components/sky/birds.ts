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
    bobPeriod: 10 + rng() * 8,
    flapPhase: rng() * 2 * Math.PI,
    flapPeriod: 1.8 + rng() * 1.6,
  }));
}

export function drawBirdSilhouette(
  ctx: CanvasRenderingContext2D,
  birds: Bird[],
  width: number,
  height: number,
  elapsed: number,
  offset: number,
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const bird of birds) {
    const normX = (bird.x + offset * bird.speedMul * 0.22) % 1.2;
    let px = normX * width;
    if (px > width) px -= width * 1.2;
    if (px < -24 || px > width + 24) continue;

    const py =
      bird.y * height +
      Math.sin((2 * Math.PI * elapsed) / bird.bobPeriod + bird.bobPhase) * 4;
    const flap = Math.sin((2 * Math.PI * elapsed) / bird.flapPeriod + bird.flapPhase);
    const wingSpan = 9 * bird.scale;
    const wingLift = (3 + flap * 3.1) * bird.scale;

    ctx.strokeStyle = `rgba(78, 86, 96, ${bird.alpha})`;
    ctx.lineWidth = Math.max(1.2, 1.35 * bird.scale);
    ctx.beginPath();
    ctx.moveTo(px - wingSpan, py + wingLift * 0.35);
    ctx.quadraticCurveTo(px - wingSpan * 0.45, py - wingLift, px, py);
    ctx.quadraticCurveTo(px + wingSpan * 0.45, py - wingLift, px + wingSpan, py + wingLift * 0.35);
    ctx.stroke();
  }

  ctx.restore();
}
