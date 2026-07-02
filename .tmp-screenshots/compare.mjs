// Quick side-by-side capture: local + reference at the same viewport.
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIEWPORT = { width: 1440, height: 900 };

const TARGETS = [
  { label: 'local', url: 'http://localhost:3000/projects', out: 'local-1440.png' },
  { label: 'ref', url: 'https://www.hirotos.com/projects/', out: 'ref-1440.png' },
];

const browser = await chromium.launch();

for (const t of TARGETS) {
  console.log('->', t.label);
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mouse-stalker, .sticker-cursor-preview, .film-grain, .webgl-background, .preloader, .route-wave { display: none !important; }
    `;
    document.documentElement.appendChild(style);
  });

  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (err) {
    console.log('NAV TIMEOUT for', t.label, '-', err.message);
  }

  // Wait for route to actually render the projects page
  await page.waitForSelector('.projects-page, .projects-gridzoom', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(3500);

  // Wait for images
  await page.evaluate(() => Promise.race([
    Promise.all(Array.from(document.querySelectorAll('img')).map(img =>
      img.complete ? Promise.resolve() :
      new Promise(r => { img.addEventListener('load', r); img.addEventListener('error', r); })
    )),
    new Promise(r => setTimeout(r, 3000)),
  ]));

  const out = path.resolve(__dirname, t.out);
  await page.screenshot({ path: out, fullPage: false });
  console.log('SAVED', out);

  // Probe card sizes
  const cardInfo = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.projects-gridzoom__grid > li, .projects-gallery > li'));
    return items.slice(0, 16).map((el) => {
      const r = el.getBoundingClientRect();
      const idx = Array.from(el.parentNode.children).indexOf(el) + 1;
      const slot8 = ((idx - 1) % 8) + 1;
      return { idx, slot8, w: Math.round(r.width), h: Math.round(r.height) };
    });
  });
  console.log('CARDS', t.label, JSON.stringify(cardInfo));

  await context.close();
}

await browser.close();
