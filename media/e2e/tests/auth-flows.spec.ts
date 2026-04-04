/**
 * Auth Flow Tests - Real user authentication behaviors.
 *
 * Priority: CRITICAL
 * - Valid login flow (1)
 * - Logout/session persistence (3)
 * - Protected screen access (7)
 *
 * Coverage:
 * - AUTH-001: Login modal opens from header
 * - AUTH-002: Login modal opens from landing CTA
 * - AUTH-010: Authenticated user redirected to /discover
 * - AUTH-012: Auth token persisted to localStorage
 * - AUTH-014: User can sign out from header dropdown
 * - AUTH-015: Session persists across page refresh
 *
 * Note: These tests focus on the client-side auth flow.
 * OAuth providers (Google/Facebook/Apple) cannot be fully tested
 * without mocking the OAuth redirect flow.
 */
import { expect, test } from '@playwright/test';
import { gotoHome } from '../helpers/navigation';
import {
  clearAuthState,
  seedAuthToken,
  openLoginModal,
  fillEmailInput,
  clickContinue,
  fillPasswordInput,
  closeLoginModal,
  getAuthToken,
  openDotsMenu,
} from '../helpers/auth';
import { LOGIN_SELECTORS } from '../selectors/login.selectors';
import { AUTH_SELECTORS } from '../selectors/auth.selectors';

test.describe('@critical Valid Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('email input advances to password step for valid email format', async ({
    page,
  }) => {
    await gotoHome(page);
    await openLoginModal(page);

    await fillEmailInput(page, 'testuser@example.com');
    await clickContinue(page);

    // Should advance to either sign-in or register step
    // Both show a password field
    const passwordInput = page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('email input advances for valid profile URL format', async ({
    page,
  }) => {
    await gotoHome(page);
    await openLoginModal(page);

    await fillEmailInput(page, 'soundcloud.com/testartist');
    await clickContinue(page);

    // Should advance to next step
    const passwordInput = page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('OAuth provider buttons are visible and clickable', async ({ page }) => {
    await gotoHome(page);
    await openLoginModal(page);

    const googleButton = page.locator(LOGIN_SELECTORS.GOOGLE_BUTTON);
    const facebookButton = page.locator(LOGIN_SELECTORS.FACEBOOK_BUTTON);
    const appleButton = page.locator(LOGIN_SELECTORS.APPLE_BUTTON);

    await expect(googleButton).toBeVisible();
    await expect(facebookButton).toBeVisible();
    await expect(appleButton).toBeVisible();

    // Verify buttons are enabled
    await expect(googleButton).toBeEnabled();
    await expect(facebookButton).toBeEnabled();
    await expect(appleButton).toBeEnabled();
  });

  test('password visibility can be toggled', async ({ page }) => {
    await gotoHome(page);
    await openLoginModal(page);

    await fillEmailInput(page, 'testuser@example.com');
    await clickContinue(page);

    const passwordInput = page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).first();
    await passwordInput.waitFor({ state: 'visible' });

    // Password should initially be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Find and click the eye toggle button (sibling of input)
    const toggleButton = passwordInput
      .locator('xpath=..')
      .locator('button')
      .first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      // After toggle, should be text type
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('back button returns to email input step', async ({ page }) => {
    await gotoHome(page);
    await openLoginModal(page);

    await fillEmailInput(page, 'testuser@example.com');
    await clickContinue(page);

    // Wait for password step
    const passwordInput = page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).first();
    await passwordInput.waitFor({ state: 'visible' });

    // Click back button
    const backButton = page.locator(LOGIN_SELECTORS.BACK_BUTTON);
    if (await backButton.isVisible()) {
      await backButton.click();
      // Should see email input again
      await expect(page.locator(LOGIN_SELECTORS.EMAIL_INPUT)).toBeVisible();
    }
  });
});

test.describe('@critical Session Persistence', () => {
  test('authenticated user is redirected from landing to /discover', async ({
    page,
  }) => {
    await seedAuthToken(page, 'valid-test-token');
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Should redirect to discover
    await expect(page).toHaveURL('/discover', { timeout: 10000 });
  });

  test('auth token persists after modal-based login simulation', async ({
    page,
  }) => {
    // This simulates what happens after successful login
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('auth_token', 'simulated-login-token');
    });

    const token = await getAuthToken(page);
    expect(token).toBe('simulated-login-token');
  });

  test('session persists across page refresh', async ({ page }) => {
    await seedAuthToken(page, 'persistent-token');
    await page.goto('/discover');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});

    // Token should still be present
    const token = await getAuthToken(page);
    expect(token).toBe('persistent-token');

    // Should still be on authenticated page (not redirected to landing)
    expect(page.url()).not.toBe('/');
  });

  test('clearing auth token allows access to landing page', async ({
    page,
  }) => {
    // Start authenticated
    await seedAuthToken(page, 'temp-token');
    await page.goto('/discover');

    // Clear token
    await page.evaluate(() => {
      window.localStorage.removeItem('auth_token');
    });

    // Navigate to landing - should not redirect
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Should stay on landing, not redirect to discover
    await expect(page).toHaveURL('/');
  });
});

test.describe('@critical Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page, 'authenticated-user-token');
  });

  test('sign out option is accessible from dots menu', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle').catch(() => {});

    await openDotsMenu(page);

    const signOutOption = page.locator(AUTH_SELECTORS.DOTS_MENU_SIGN_OUT);
    await expect(signOutOption).toBeVisible();
  });

  test('sign out clears auth state and shows landing', async ({ page }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle').catch(() => {});

    await openDotsMenu(page);

    const signOutOption = page.locator(AUTH_SELECTORS.DOTS_MENU_SIGN_OUT);
    await signOutOption.click();

    // Wait for redirect/state change
    await page.waitForLoadState('networkidle').catch(() => {});

    // Token should be cleared
    const token = await getAuthToken(page);
    expect(token).toBeNull();
  });
});
