export function drawTrackedText(
  ctx,
  text,
  { x, y, font, color, align = 'center', letterSpacing = 0, maxWidth = Infinity },
) {
  ctx.save();
  ctx.font = font;
  const width = Array.from(text).reduce(
    (sum, char, index) =>
      sum + ctx.measureText(char).width + (index === text.length - 1 ? 0 : letterSpacing),
    0,
  );
  const scaleX = Number.isFinite(maxWidth) ? Math.min(1, maxWidth / Math.max(width, 1)) : 1;
  let cursor = align === 'center' ? -width / 2 : align === 'right' ? -width : 0;
  ctx.translate(x, y);
  ctx.scale(scaleX, 1);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  Array.from(text).forEach((char) => {
    ctx.fillText(char, cursor, 0);
    cursor += ctx.measureText(char).width + letterSpacing;
  });
  ctx.restore();
}
