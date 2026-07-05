export function buildSunGlowCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const gx = width * 0.82, gy = height * 0.18;
  const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(width, height) * 0.6);
  grd.addColorStop(0, 'rgba(255, 250, 235, 0.5)');
  grd.addColorStop(0.35, 'rgba(255, 245, 220, 0.12)');
  grd.addColorStop(1, 'rgba(255, 245, 220, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

export function drawSunGlow(ctx: CanvasRenderingContext2D, glowCanvas: HTMLCanvasElement | null, elapsed: number): void {
  if (!glowCanvas) return;
  ctx.globalAlpha = Math.min(Math.max(1 + 0.06 * Math.sin(2 * Math.PI * elapsed / 20), 0.85), 1.15);
  ctx.drawImage(glowCanvas, 0, 0);
  ctx.globalAlpha = 1;
}
