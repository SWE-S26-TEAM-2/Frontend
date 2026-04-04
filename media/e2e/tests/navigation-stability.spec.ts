/**
 * Navigation Stability Tests.
 *
 * Coverage:
 * - NAV-001 through NAV-008: Navigation link verification
 * - STAB-004: Rapid tab switching does not break state
 * - STAB-005: Multiple modal open/close cycles stable
 *
 * These tests verify navigation remains stable under repeated/rapid use.
 */
import { expect, test } from '@playwright/test';
import { gotoHome, gotoSettings, gotoProfile } from '../helpers/navigation';
import {
  seedAuthToken,
  clearAuthState,
  openLoginModal,
  closeLoginModal,
} from '../helpers/auth';
import { TEST_USERS } from '../helpers/profile';

test.describe('Navigation - Core Links (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
    await page.goto('/discover');
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('all primary nav links navigate correctly', async ({ page }) => {
    // Home
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      // May redirect back if authenticated, that's expected
    }

    // Feed
    await page.goto('/discover');
    const feedLink = page.locator('a[href="/feed"]').first();
    if (await feedLink.isVisible()) {
      await feedLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      expect(page.url()).toContain('/feed');
    }

    // Library
    await page.goto('/discover');
    const libraryLink = page.locator('a[href="/library"]').first();
    if (await libraryLink.isVisible()) {
      await libraryLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      expect(page.url()).toContain('/library');
    }
  });

  test('logo navigates to home', async ({ page }) => {
    // Click on soundcloud logo/text
    const logo = page.locator('a:has-text("soundcloud")').first();
    await logo.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    // Authenticated users may go to discover, unauthenticated to /
    expect(page.url()).toMatch(/\/(discover)?$/);
  });

  test('upload link navigates to upload page', async ({ page }) => {
    const uploadLink = page.locator('a[href="/upload"]').first();
    if (await uploadLink.isVisible()) {
      await uploadLink.click();
      await page.waitForLoadState('networkidle').catch(() => {});
      expect(page.url()).toContain('/upload');
    }
  });
});

test.describe('@critical Protected Route Access', () => {
  test('unauthenticated user can access landing page', async ({ page }) => {
    await clearAuthState(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Should stay on landing, see hero content
    await expect(page).toHaveURL('/');
  });

  test('authenticated user redirects from landing to discover', async ({
    page,
  }) => {
    await seedAuthToken(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Should redirect to discover
    await expect(page).toHaveURL('/discover');
  });

  test('settings page accessible when authenticated', async ({ page }) => {
    await seedAuthToken(page);
    await page.goto('/settings/account');
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveURL('/settings/account');
  });
});

test.describe('@high Rapid Tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('rapid navigation between main sections does not break', async ({
    page,
  }) => {
    await page.goto('/discover');

    const routes = ['/feed', '/library', '/discover', '/feed', '/library'];

    for (const route of routes) {
      await page.goto(route);
      // Don't wait for full networkidle, just domcontentloaded for speed
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(route);
    }

    // Final check - page should be stable
    await expect(page.locator('body')).toBeVisible();
  });

  test('rapid back/forward navigation is stable', async ({ page }) => {
    await page.goto('/discover');
    await page.goto('/feed');
    await page.goto('/library');

    // Go back twice
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/feed');

    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/discover');

    // Go forward
    await page.goForward();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/feed');
  });

  test('10 navigation cycles complete without error', async ({ page }) => {
    const routes = ['/discover', '/feed', '/library', '/settings/account'];

    for (let i = 0; i < 10; i++) {
      const route = routes[i % routes.length];
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
    }

    // Page should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('@high Modal Stability', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('modal open/close 10 times without error', async ({ page }) => {
    await gotoHome(page);

    for (let i = 0; i < 10; i++) {
      await openLoginModal(page);
      await closeLoginModal(page);
    }

    // Page should be stable
    await expect(page.locator('body')).toBeVisible();
    // No modal should be open
    await expect(page.getByText('Sign in or create an account')).toBeHidden();
  });

  test('interleaved navigation and modal operations', async ({ page }) => {
    await gotoHome(page);

    // Open modal
    await openLoginModal(page);

    // Close and navigate (modal close first to prevent blocking)
    await closeLoginModal(page);

    // Navigate away
    await page.goto('/login');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Modal should be visible on /login route
    await expect(page.getByText('Sign in or create an account')).toBeVisible();

    // Close and go back home
    const closeButton = page.getByRole('button', { name: '✕' });
    await closeButton.click();

    await page.waitForLoadState('networkidle').catch(() => {});
    // Should be back at home
    await expect(page).toHaveURL('/');
  });
});

test.describe('@medium Profile Tab Stability', () => {
  test('rapid profile tab switching is stable', async ({ page }) => {
    await gotoProfile(page, TEST_USERS.artist);

    const tabs = ['All', 'Popular tracks', 'Playlists', 'Reposts', 'All'];

    for (const tabName of tabs) {
      const tab = page.getByRole('button', { name: tabName, exact: true });
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(200); // Brief pause for UI update
      }
    }

    // Should end on All tab
    const allTab = page.getByRole('button', { name: 'All', exact: true });
    await expect(allTab).toBeVisible();
  });
});

test.describe('@medium Settings Tab Stability', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('rapid settings tab navigation is stable', async ({ page }) => {
    await gotoSettings(page, 'account');

    const settingsTabs = [
      '/settings/content',
      '/settings/notifications',
      '/settings/privacy',
      '/settings/account',
    ];

    for (const tab of settingsTabs) {
      await page.goto(tab);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(tab);
    }

    // Settings heading should still be visible
    await expect(
      page.locator('main').first().getByRole('heading', { name: 'Settings' })
    ).toBeVisible();
  });
});
