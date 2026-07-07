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
  weavePhase: number;
  weavePeriod: number;
};

const BIRD_WRAP_MODULUS = 1.2;

const wrapPosition = (value: number, modulus: number) => ((value % modulus) + modulus) % modulus;

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
    weavePhase: rng() * 2 * Math.PI,
    weavePeriod: 18 + rng() * 14,
  }));
}

export function drawBirdSilhouette(
  ctx: CanvasRenderingContext2D,
  birds: Bird[],
  width: number,
  height: number,
  elapsed: number,
  windOffset: number,
  ascend = 0,
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const bird of birds) {
    const normX = wrapPosition(bird.x + windOffset * bird.speedMul * 0.22, BIRD_WRAP_MODULUS);
    const wrapProgress = normX / BIRD_WRAP_MODULUS;
    const fadeInWindow = 0.15;
    const fadeOutWindow = 0.45;
    const tIn  = Math.min(1, Math.max(0, wrapProgress / fadeInWindow));
    const tOut = Math.min(1, Math.max(0, (1 - wrapProgress) / fadeOutWindow));
    const fadeIn  = 1 - (1 - tIn) * (1 - tIn);   // easeOutQuad
    const fadeOut = 1 - (1 - tOut) * (1 - tOut);  // easeOutQuad — gentle tail, no harsh cutoff
    const wrapFade = Math.min(fadeIn, fadeOut);
    const distanceScale = 1 - wrapProgress * 0.42;
    const distanceFade = 1 - wrapProgress * 0.32;
    const perspectiveScale = bird.scale * distanceScale;
    let px = normX * width;
    px += Math.sin((2 * Math.PI * elapsed) / bird.weavePeriod + bird.weavePhase) * 10 * perspectiveScale;
    if (px < -24 || px > width + 24) continue;

    const py =
      bird.y * height +
      wrapProgress * height * -0.06 +
      Math.sin((2 * Math.PI * elapsed) / bird.bobPeriod + bird.bobPhase) * 4 +
      Math.sin((2 * Math.PI * elapsed) / (bird.weavePeriod * 0.7) + bird.weavePhase) * 2.5;
    const flap = Math.sin((2 * Math.PI * elapsed) / bird.flapPeriod + bird.flapPhase);
    const wingSpan = 9 * perspectiveScale;
    const wingLift = (3 + flap * 3.1) * perspectiveScale;

    ctx.strokeStyle = `rgba(78, 86, 96, ${bird.alpha * wrapFade * distanceFade * (1 - ascend)})`;
    ctx.lineWidth = Math.max(0.9, 1.35 * perspectiveScale);
    ctx.beginPath();
    ctx.moveTo(px - wingSpan, py + wingLift * 0.35);
    ctx.quadraticCurveTo(px - wingSpan * 0.45, py - wingLift, px, py);
    ctx.quadraticCurveTo(px + wingSpan * 0.45, py - wingLift, px + wingSpan, py + wingLift * 0.35);
    ctx.stroke();
  }

  ctx.restore();
}
