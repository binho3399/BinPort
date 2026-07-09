import { expect, test } from '@playwright/test';

test('home shell and model load', async ({ page }) => {
  await page.goto('/');
  const shell = page.locator('.persistent-experience');
  await expect(shell).toBeVisible();
  await expect(page.locator('.webgl-background')).toBeVisible();
  await expect(page.locator('.route-current')).toBeVisible();
  await expect(page.locator('.site-nav')).toBeVisible();
  await expect(page.locator('.experience-page--home')).toBeVisible();
  await expect(page.locator('.sky-layer canvas')).toHaveCount(2);

  const experienceMode = await shell.getAttribute('data-experience-mode');
  if (experienceMode === 'full') {
    const canvas = page.locator('.webgl-background canvas').last();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.height ?? 0).toBeGreaterThan(0);
    await expect.poll(async () =>
      page.evaluate(() =>
        performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/models/model.glb')),
      ),
    ).toBeTruthy();
  } else {
    await expect(page.locator('.webgl-canvas-wrap')).toHaveCount(0);
  }
});

test('navigation transitions and routes keep shell stable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.waitForURL('**/projects');
  await expect(page.locator('.experience-page--projects')).toBeVisible();
  const visibleProjectCards = page.locator('.projects-stack__card');
  expect(await visibleProjectCards.count()).toBeGreaterThan(0);
  await expect(page.locator('.persistent-experience')).toHaveAttribute('data-transitioning', 'false');
});

test('about toggle and contact links', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('.experience-page--about')).toBeVisible();
  await page.getByRole('button', { name: 'JA' }).click();
  await expect(page.getByRole('button', { name: 'JA' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/contact');
  await expect(page.locator('.experience-page--contact')).toBeVisible();
  await expect(page.locator('.contact-page__links a')).toHaveCount(2);
});

test('yellow canvas test is standalone', async ({ page }) => {
  await page.goto('/yellow-canvas-test');
  await expect(page.locator('.persistent-experience')).toHaveCount(0);
});

test.describe('adaptive experience mode policy', () => {
  test('reduced motion falls back to minimal shell mode without home WebGL model', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const shell = page.locator('.persistent-experience');
    await expect(shell).toHaveCount(1);
    await expect(page.locator('.experience-page--home')).toBeVisible();
    await expect(shell).toHaveAttribute('data-experience-mode', 'minimal');
    await expect(page.locator('.sky-layer canvas')).toHaveCount(2);
    await expect(page.locator('.webgl-canvas-wrap')).toHaveCount(0);
    await expect.poll(async () =>
      page.evaluate(() =>
        performance.getEntriesByType('resource').some((entry) => entry.name.endsWith('/models/model.glb')),
      ),
    ).toBeFalsy();
  });

  test('coarse pointer falls back to reduced shell mode without home WebGL model', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/');

    const shell = page.locator('.persistent-experience');
    await expect(shell).toHaveCount(1);
    await expect(page.locator('.experience-page--home')).toBeVisible();
    await expect(shell).toHaveAttribute('data-experience-mode', 'reduced');
    await expect(page.locator('.sky-layer canvas')).toHaveCount(2);
    await expect(page.locator('.webgl-canvas-wrap')).toHaveCount(0);

    await context.close();
  });
});
