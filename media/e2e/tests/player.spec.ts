import { test, expect } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';

test.describe('Global Audio Player', () => {
  test.beforeEach(async ({ page }) => {
    // Seed auth token to bypass login and gain full access
    await seedAuthToken(page);
  });

  test('clicking play on a track reveals the global footer player', async ({ page }) => {
    // Navigate to a page with tracks (e.g., home/feed)
    await page.goto('/home');

    // Wait for tracks to load
    await page.waitForSelector('[data-testid="track-card"]', { state: 'visible', timeout: 10000 });

    // The footer player should not be visible initially
    await expect(page.locator('[data-testid="global-player"]')).not.toBeVisible();

    // Find the first track's play button and click it
    const firstTrackPlayBtn = page.locator('[data-testid="track-card"] [aria-label="Play"]').first();
    await firstTrackPlayBtn.click();

    // The global footer player should now be visible
    const globalPlayer = page.locator('[data-testid="global-player"]');
    await expect(globalPlayer).toBeVisible();

    // Verify player controls are present
    await expect(globalPlayer.locator('[aria-label="Pause"]')).toBeVisible();
    await expect(globalPlayer.locator('[role="slider"]')).toHaveCount(2); // Progress and Volume
  });

  test('player controls can toggle playback state', async ({ page }) => {
    await page.goto('/home');
    await page.waitForSelector('[data-testid="track-card"]', { state: 'visible' });

    // Start playback
    await page.locator('[data-testid="track-card"] [aria-label="Play"]').first().click();
    
    const globalPlayer = page.locator('[data-testid="global-player"]');
    await expect(globalPlayer).toBeVisible();

    // Click Pause in the global player
    const pauseBtn = globalPlayer.locator('[aria-label="Pause"]');
    await pauseBtn.click();

    // Verify it changed to Play
    await expect(globalPlayer.locator('[aria-label="Play"]')).toBeVisible();
  });
});
