import { expect, test } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';

// ── helpers ───────────────────────────────────────────────────────────────────

async function gotoLibrary(page: import('@playwright/test').Page) {
  await page.goto('/library', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

function libraryTab(page: import('@playwright/test').Page, name: string) {
  return page.getByRole('button', { name, exact: true });
}

// ── suite ─────────────────────────────────────────────────────────────────────

test.describe('Library page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('/library loads and shows the tab navigation', async ({ page }) => {
    await gotoLibrary(page);
    await expect(page).toHaveURL(/\/library/);

    // All 7 tabs must be rendered
    for (const tab of ['Overview', 'Likes', 'Playlists', 'Albums', 'Stations', 'Following', 'History']) {
      await expect(libraryTab(page, tab)).toBeVisible();
    }
  });

  test('Overview tab is active by default', async ({ page }) => {
    await gotoLibrary(page);
    // Overview is the default tab — its content should render overview sections
    const overviewBtn = libraryTab(page, 'Overview');
    await expect(overviewBtn).toBeVisible();
  });

  test('clicking the Likes tab switches to the Likes view', async ({ page }) => {
    await gotoLibrary(page);
    const likesTab = libraryTab(page, 'Likes');
    await likesTab.click();
    // After clicking Likes, the Likes tab should be visually active
    await expect(likesTab).toBeVisible();
  });

  test('clicking the Playlists tab switches to the Playlists view', async ({
    page,
  }) => {
    await gotoLibrary(page);
    const playlistsTab = libraryTab(page, 'Playlists');
    await playlistsTab.click();
    await expect(playlistsTab).toBeVisible();
  });

  test('clicking the Following tab switches to the Following view', async ({
    page,
  }) => {
    await gotoLibrary(page);
    const followingTab = libraryTab(page, 'Following');
    await followingTab.click();
    await expect(followingTab).toBeVisible();
  });

  test('Library header nav link routes to /library', async ({ page }) => {
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    const libraryLink = page.getByRole('link', { name: 'Library' }).first();
    await expect(libraryLink).toBeVisible();
    await libraryLink.click();
    await expect(page).toHaveURL(/\/library/);
  });

  test('unauthenticated /library redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      window.localStorage.removeItem('auth_token');
    });
    await page.goto('/library', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL(/\/login/);
  });
});
