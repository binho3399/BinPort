// Debug: dump the local DOM structure for the projects page.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();

const consoleLogs = [];
page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => consoleLogs.push(`[pageerror] ${err.message}`));

await page.addInitScript(() => {
  const style = document.createElement('style');
  style.textContent = '.mouse-stalker, .sticker-cursor-preview, .film-grain, .webgl-background, .preloader, .route-wave { display: none !important; }';
  document.documentElement.appendChild(style);
});

try { await page.goto('http://localhost:3000/projects', { waitUntil: 'domcontentloaded', timeout: 20000 }); } catch (e) { console.log('NAV TIMEOUT', e.message); }
await page.waitForTimeout(5000);

const dump = await page.evaluate(() => {
  const out = {};
  out.bodyHTMLLen = document.body.innerHTML.length;
  out.bodyClass = document.body.className;
  out.experiencePageProjects = document.querySelector('.experience-page--projects')?.outerHTML?.slice(0, 2000) ?? null;
  out.projectsPage = document.querySelector('.projects-page')?.outerHTML?.slice(0, 2000) ?? null;
  out.marquee = document.querySelector('.projects-marquee')?.outerHTML?.slice(0, 1000) ?? null;
  out.gallery = document.querySelector('.projects-gallery')?.outerHTML?.slice(0, 500) ?? null;
  out.rowCard = document.querySelector('.projects-row__card')?.outerHTML?.slice(0, 500) ?? null;
  out.allProjectClasses = Array.from(new Set(Array.from(document.querySelectorAll('[class*="project"]')).map(el => el.className.toString().split(/\s+/).filter(c => c.includes('project')).join(' '))));
  return out;
});

console.log('CONSOLE LOGS:');
consoleLogs.forEach((l) => console.log(' ', l));
console.log('\nDUMP:');
console.log(JSON.stringify(dump, null, 2));

await page.screenshot({ path: '.tmp-screenshots/local-debug.png' });
await browser.close();
