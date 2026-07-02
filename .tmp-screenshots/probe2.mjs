import { chromium } from 'playwright';

async function probe() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });
  await page.waitForSelector('.projects-marquee__card');
  await page.waitForTimeout(1200);

  // Check actual viewport size
  const vp = await page.evaluate(() => ({ innerWidth, innerHeight }));
  console.log(`Viewport: ${vp.innerWidth} × ${vp.innerHeight}`);

  // Query cards with sub-pixel precision
  const cards = await page.$$eval(
    '.projects-marquee__set:first-child .projects-marquee__card',
    (els) =>
      els.map((el, i) => {
        const rect = el.getBoundingClientRect();
        return {
          slot: i + 1,
          width: rect.width,
          height: rect.height,
          wRound: Math.round(rect.width),
          hRound: Math.round(rect.height),
        };
      }),
  );

  console.log('\n=== Card sizes (sub-pixel) ===');
  for (const c of cards) {
    console.log(`  slot ${c.slot}: ${c.width.toFixed(2)} × ${c.height.toFixed(2)}  (rounded: ${c.wRound} × ${c.hRound})`);
  }

  // Check the computed style on the first two cards
  const styles = await page.$$eval(
    '.projects-marquee__set:first-child .projects-marquee__card',
    (els) =>
      els.slice(0, 2).map((el) => {
        const cs = getComputedStyle(el);
        return {
          width: cs.width,
          height: cs.height,
          flex: cs.flex,
          opacity: cs.opacity,
        };
      }),
  );
  console.log('\n=== Computed styles (first 2 cards) ===');
  for (let i = 0; i < styles.length; i++) {
    console.log(`  card ${i + 1}: width=${styles[i].width} height=${styles[i].height} flex=${styles[i].flex} opacity=${styles[i].opacity}`);
  }

  await browser.close();
}

probe().catch((err) => {
  console.error('Probe failed:', err);
  process.exit(1);
});
