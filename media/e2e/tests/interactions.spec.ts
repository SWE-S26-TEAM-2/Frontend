import { test, expect } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';
import { gotoFeedShell, skipIfFeedHasNoTracks } from '../helpers/feed';

test.describe('Social and Library Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('user can like a track from the feed', async ({ page }, testInfo) => {
    await gotoFeedShell(page);
    await skipIfFeedHasNoTracks(testInfo, page);

    const firstTrack = page.locator('[data-testid="track-card"]').first();
    const likeBtn = firstTrack.locator('[aria-label="Like track"]');

    await expect(likeBtn).toBeVisible();
    await likeBtn.click();
  });

  test('user can follow another user from their profile', async ({ page }) => {
    await page.goto('/users/1');
    await page.waitForSelector('h1', { state: 'visible' });

    const followBtn = page.getByRole('button', { name: /Follow/i });
    if (await followBtn.isVisible()) {
      await followBtn.click();
      await expect(page.getByRole('button', { name: /Following/i })).toBeVisible();
    }
  });

  test('feed track overflow menu exposes add-to-queue', async ({
    page,
  }, testInfo) => {
    await gotoFeedShell(page);
    await skipIfFeedHasNoTracks(testInfo, page);

    const firstTrack = page.locator('[data-testid="track-card"]').first();
    await firstTrack.getByRole('button', { name: 'More options' }).click();

    const addToQueue = page.getByText('Add to queue', { exact: true });
    await expect(addToQueue).toBeVisible();
    await addToQueue.click();
    await expect(addToQueue).toBeHidden();
  });
});
