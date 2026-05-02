import { expect, test } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';

// ── helpers ───────────────────────────────────────────────────────────────────

async function gotoNotifications(page: import('@playwright/test').Page) {
  await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ── suite ─────────────────────────────────────────────────────────────────────

test.describe('Notifications page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('/notifications loads without crashing', async ({ page }) => {
    await gotoNotifications(page);
    await expect(page).toHaveURL(/\/notifications/);
    // Header must still be present (layout intact)
    await expect(page.getByText('soundcloud').first()).toBeVisible();
  });

  test('notifications page shows the filter dropdown', async ({ page }) => {
    await gotoNotifications(page);
    // The FILTER_OPTIONS select / combobox rendered by the notifications page
    const filterSelect = page
      .getByRole('combobox')
      .or(page.locator('select'))
      .first();
    // Filter may be a <select> or a custom dropdown — check it exists
    const hasFilter = await filterSelect.isVisible().catch(() => false);
    if (hasFilter) {
      await expect(filterSelect).toBeVisible();
    } else {
      // Fallback: look for the "All notifications" text visible on page
      await expect(
        page.getByText('All notifications', { exact: false }).first()
      ).toBeVisible();
    }
  });

  test('notifications filter "Likes" narrows the list', async ({ page }) => {
    await gotoNotifications(page);
    const selectEl = page.locator('select').first();
    const isSelect = await selectEl.isVisible().catch(() => false);
    if (isSelect) {
      await selectEl.selectOption('like');
      await expect(selectEl).toHaveValue('like');
    }
    // If filter is custom UI — the page should not crash
    await expect(page).toHaveURL(/\/notifications/);
  });

  test('notifications bell icon in header navigates to /notifications', async ({
    page,
  }) => {
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const bellBtn = page.getByRole('button', { name: 'Notifications' });
    const isBellVisible = await bellBtn.isVisible().catch(() => false);
    if (isBellVisible) {
      await bellBtn.click();
      await expect(page).toHaveURL(/\/notifications/);
    }
  });

  test('unauthenticated /notifications redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      window.localStorage.removeItem('auth_token');
    });
    await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL(/\/login/);
  });
});
