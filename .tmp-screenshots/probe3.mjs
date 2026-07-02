import { chromium } from 'playwright';

async function probe() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });
  await page.waitForSelector('.projects-marquee__card');
  await page.waitForTimeout(3000);  // wait longer for everything to settle

  // Check inline styles and computed transforms
  const details = await page.$$eval(
    '.projects-marquee__set:first-child .projects-marquee__card',
    (els) =>
      els.slice(0, 2).map((el) => {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          slot: Array.from(el.parentNode.children).indexOf(el) + 1,
          boundingWidth: rect.width,
          boundingHeight: rect.height,
          computedWidth: cs.width,
          computedHeight: cs.height,
          computedTransform: cs.transform,
          inlineStyle: el.getAttribute('style'),
          enterPending: el.closest('[data-enter-pending]')?.getAttribute('data-enter-pending'),
        };
      }),
  );

  for (const d of details) {
    console.log(`Slot ${d.slot}:`);
    console.log(`  boundingRect: ${d.boundingWidth.toFixed(2)} × ${d.boundingHeight.toFixed(2)}`);
    console.log(`  computedStyle: width=${d.computedWidth} height=${d.computedHeight}`);
    console.log(`  computed transform: ${d.computedTransform}`);
    console.log(`  inline style: ${d.inlineStyle}`);
    console.log(`  data-enter-pending: ${d.enterPending}`);
    console.log('');
  }

  await browser.close();
}

probe().catch((err) => {
  console.error('Probe failed:', err);
  process.exit(1);
});
