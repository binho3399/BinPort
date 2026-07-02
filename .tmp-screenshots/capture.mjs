// Quick screenshot capture for /projects page (ESM)
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const URL = 'http://localhost:4040/projects';
const OUT = path.resolve(__dirname, 'projects-desktop.png');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.addInitScript(() => {
  const style = document.createElement('style');
  style.textContent = `
    .custom-cursor, [class*="cursor"], [data-cursor], #cursor, #custom-cursor {
      display: none !important;
    }
  `;
  document.documentElement.appendChild(style);
});

await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

// Wait for the preloader to actually dismiss
await page.waitForFunction(() => {
  const el = document.querySelector('.preloader');
  if (!el) return true;
  const style = window.getComputedStyle(el);
  return style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0;
}, { timeout: 15000 });
await page.waitForTimeout(1500); // give GSAP entrance + wave a moment to settle

// Wait for all images inside gallery to load
await page.evaluate(() => Promise.all(
  Array.from(document.querySelectorAll('img')).map(img =>
    img.complete ? Promise.resolve() :
    new Promise(r => { img.addEventListener('load', r); img.addEventListener('error', r); })
  )
));
await page.waitForTimeout(800);

await page.screenshot({ path: OUT, fullPage: false });
console.log('SAVED', OUT);

await browser.close();
