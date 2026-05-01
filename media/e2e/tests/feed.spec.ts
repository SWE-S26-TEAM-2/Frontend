import { expect, test } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';

// ── helpers ───────────────────────────────────────────────────────────────────

async function gotoFeed(page: import('@playwright/test').Page) {
  await page.goto('/stream', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function gotoHomePage(page: import('@playwright/test').Page) {
  await page.goto('/home', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ── suite ─────────────────────────────────────────────────────────────────────

test.describe('Feed and Home pages', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('/home page loads and shows the header with navigation', async ({
    page,
  }) => {
    await gotoHomePage(page);
    await expect(page).toHaveURL(/\/home/);
    // Header brand must be visible
    await expect(page.getByText('soundcloud').first()).toBeVisible();
    // Nav items present
    await expect(page.getByRole('link', { name: 'Feed' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Library' }).first()).toBeVisible();
  });

  test('/stream (Feed) page loads without crashing', async ({ page }) => {
    await gotoFeed(page);
    await expect(page).toHaveURL(/\/stream/);
    // Header must still be visible (layout intact)
    await expect(page.getByText('soundcloud').first()).toBeVisible();
  });

  test('Feed nav link in header routes to /stream', async ({ page }) => {
    await gotoHomePage(page);
    const feedLink = page.getByRole('link', { name: 'Feed' }).first();
    await expect(feedLink).toBeVisible();
    await feedLink.click();
    await expect(page).toHaveURL(/\/stream/);
  });

  test('Home nav link in header routes to /home', async ({ page }) => {
    await gotoFeed(page);
    const homeLink = page.getByRole('link', { name: 'Home' }).first();
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL(/\/home/);
  });

  test('unauthenticated /stream redirects to login', async ({ page }) => {
    // No seedAuthToken — clear state so middleware triggers
    await page.addInitScript(() => {
      window.localStorage.removeItem('auth_token');
    });
    await page.goto('/stream', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL(/\/login/);
  });
});
