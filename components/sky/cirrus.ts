export type CirrusParticle = { x: number; y: number; r: number; alpha: number; speedMul: number; bobPhase: number; bobPeriod: number };

export function buildCirrusParticles(rng: () => number, count: number): CirrusParticle[] {
  return Array.from({ length: count }, () => ({
    x: rng(),
    y: rng(),
    r: rng() > 0.5 ? 3 : 2,
    alpha: 0.2 + rng() * 0.3,
    speedMul: 0.6 + rng() * 0.8,
    bobPhase: rng() * 2 * Math.PI,
    bobPeriod: 12 + rng() * 8,
  }));
}

export function drawCirrusParticles(
  ctx: CanvasRenderingContext2D,
  particles: CirrusParticle[],
  width: number,
  height: number,
  elapsed: number,
  offset: number,
): void {
  for (const p of particles) {
    const normX = (p.x + offset * p.speedMul * 0.6) % 1.2;
    let px = normX * width;
    if (px > width) px -= width * 1.2;
    const py = p.y * height + Math.sin(2 * Math.PI * elapsed / p.bobPeriod + p.bobPhase) * 4;
    if (px < 0) continue;
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.fillRect(px, py, p.r, p.r);
  }
}
