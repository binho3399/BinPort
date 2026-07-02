// Final verification: probe card sizes on both local and reference at 1440x900.
import { chromium } from 'playwright';

const browser = await chromium.launch();

async function probe(url, label) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // Hide heavy overlays AFTER navigation (avoids the appendChild race)
  await page.route('**/*', (route) => route.continue());

  try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 }); } catch (e) { console.log('NAV TIMEOUT', label, e.message); }
  await page.waitForTimeout(2000);

  await page.addStyleTag({ content: '.mouse-stalker, .sticker-cursor-preview, .film-grain, .webgl-background, .preloader, .route-wave { display: none !important; }' });

  await page.waitForSelector('.projects-marquee, .projects-page', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.projects-marquee__item'));
    return items.slice(0, 8).map((el) => {
      const r = el.getBoundingClientRect();
      const idx = Array.from(el.parentNode.children).indexOf(el) + 1;
      const slot8 = ((idx - 1) % 8) + 1;
      return { idx, slot8, w: Math.round(r.width), h: Math.round(r.height) };
    });
  });

  await page.screenshot({ path: `.tmp-screenshots/${label}-1440.png` });
  console.log('CARDS', label, JSON.stringify(data));
  await context.close();
}

await probe('http://localhost:3000/projects', 'local-final');
await probe('https://www.hirotos.com/projects/', 'ref-final');
await browser.close();
