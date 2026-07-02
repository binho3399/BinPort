import { chromium } from 'playwright';

const VIEWPORT = { width: 1440, height: 900 };

async function probe() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });

  // Wait for cards to render and entrance animation to finish
  await page.waitForSelector('.projects-marquee__card');
  await page.waitForTimeout(1200);

  // Query only cards in the first set (first 8 items)
  const cards = await page.$$eval(
    '.projects-marquee__set:first-child .projects-marquee__card',
    (els) =>
      els.map((el, i) => {
        const rect = el.getBoundingClientRect();
        return { slot: i + 1, width: Math.round(rect.width), height: Math.round(rect.height) };
      }),
  );

  console.log('=== Card sizes at 1440px viewport (first set) ===');
  for (const c of cards) {
    console.log(`  slot ${c.slot}: ${c.width} × ${c.height} px`);
  }

  // Reference sizes
  const ref = {
    1: [302, 215],
    2: [199, 262],
    3: [302, 215],
    4: [199, 262],
    5: [346, 202],
    6: [199, 262],
    7: [302, 215],
    8: [199, 262],
  };

  console.log('\n=== Comparison with reference ===');
  let allMatch = true;
  for (const c of cards) {
    const [rw, rh] = ref[c.slot];
    const dw = Math.abs(c.width - rw);
    const dh = Math.abs(c.height - rh);
    const ok = dw <= 3 && dh <= 3;
    if (!ok) allMatch = false;
    console.log(
      `  slot ${c.slot}: local ${c.width}×${c.height} vs ref ${rw}×${rh} — ${ok ? 'OK' : `OFF by ${dw}×${dh}px`}`,
    );
  }

  if (allMatch) {
    console.log('\n✓ All card sizes match the reference within 3px.');
  } else {
    console.log('\n✗ Some card sizes deviate from reference.');
  }

  // Check the reference's per-set total width for verification
  const trackWidth = await page.$eval('.projects-marquee__track', (el) => el.scrollWidth);
  const setWidth = await page.$eval('.projects-marquee__set:first-child', (el) => el.scrollWidth);
  console.log(`\nTrack scrollWidth: ${trackWidth}px`);
  console.log(`First set scrollWidth: ${setWidth}px`);
  console.log(`Track is ${(trackWidth / setWidth).toFixed(2)}× the set width (should be ~2)`);

  await browser.close();
}

probe().catch((err) => {
  console.error('Probe failed:', err);
  process.exit(1);
});
