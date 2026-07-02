import { expect, test } from '@playwright/test';

test('home shell and model load', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.persistent-experience')).toBeVisible();
  await expect(page.locator('.webgl-background')).toBeVisible();
  await expect(page.locator('.route-current')).toBeVisible();
  await expect(page.locator('.site-nav')).toBeVisible();
  await expect(page.locator('.experience-page--home')).toBeVisible();
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
});

test('navigation transitions and routes keep shell stable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Projects' }).click();
  await page.waitForURL('**/projects');
  await expect(page.locator('.experience-page--projects')).toBeVisible();
  await expect(page.locator('.projects-marquee__set')).toHaveCount(2);
  await expect(page.locator('.projects-marquee__set[aria-hidden="true"]')).toHaveCount(1);
  const visibleProjectCards = page.locator('.projects-marquee__set').first().locator('.projects-marquee__card');
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
