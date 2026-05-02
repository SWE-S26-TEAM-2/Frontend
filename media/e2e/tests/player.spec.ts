import { test, expect, type TestInfo } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';
import { gotoFeedShell, skipIfFeedHasNoTracks } from '../helpers/feed';

async function gotoStreamWithTracks(
  page: import('@playwright/test').Page,
  testInfo: TestInfo
) {
  await gotoFeedShell(page);
  await skipIfFeedHasNoTracks(testInfo, page);
  await expect(page.locator('[data-testid="track-card"]').first()).toBeVisible({
    timeout: 15000,
  });
}

test.describe('Global Audio Player', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('clicking play on a feed track activates pause in the footer player', async ({
    page,
  }, testInfo) => {
    await gotoStreamWithTracks(page, testInfo);

    const footer = page.locator('[data-testid="global-player"]');
    await expect(footer).toBeVisible();

    await page
      .locator('[data-testid="track-card"]')
      .filter({ has: page.getByRole('button', { name: 'Play' }) })
      .first()
      .getByRole('button', { name: 'Play' })
      .click();

    await expect(footer.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  test('footer transport toggles playback state', async ({ page }, testInfo) => {
    await gotoStreamWithTracks(page, testInfo);

    await page
      .locator('[data-testid="track-card"]')
      .filter({ has: page.getByRole('button', { name: 'Play' }) })
      .first()
      .getByRole('button', { name: 'Play' })
      .click();

    const footer = page.locator('[data-testid="global-player"]');
    await expect(footer.getByRole('button', { name: 'Pause' })).toBeVisible();
    await footer.getByRole('button', { name: 'Pause' }).click();
    await expect(footer.getByRole('button', { name: 'Play' })).toBeVisible();
  });
});
