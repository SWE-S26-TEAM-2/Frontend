import { expect, test } from '@playwright/test';
import { gotoHome, gotoLogin } from '../helpers/navigation';
import { clearAuthState } from '../helpers/auth';

test.describe('Auth entry points', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('home page renders hero content and opens/closes the sign-in modal', async ({
    page,
  }) => {
    await gotoHome(page);
    const landingPage = page.locator('main').first();
    const landingHeader = landingPage.locator('header').first();

    await expect(
      landingPage.getByRole('heading', {
        name: "Hear what's trending for free in the SoundCloud community",
      })
    ).toBeVisible();

    const signInButton = landingHeader.getByRole('button', { name: 'Sign in' });
    await signInButton.waitFor({ state: 'visible' });
    await signInButton.click();

    const authModal = page
      .locator('div')
      .filter({
        has: page.getByRole('heading', { name: 'Sign in or create an account' }),
      })
      .nth(0);
    await authModal.waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(
      authModal.getByRole('heading', { name: 'Sign in or create an account' })
    ).toBeVisible();
    await expect(
      authModal.getByRole('button', { name: 'Continue with Facebook' })
    ).toBeVisible();
    await expect(
      authModal.getByRole('button', { name: 'Continue with Google' })
    ).toBeVisible();
    await expect(
      authModal.getByRole('button', { name: 'Continue with Apple' })
    ).toBeVisible();
    await expect(
      authModal.getByPlaceholder('Your email address or profile URL')
    ).toBeVisible();

    const closeButton = authModal.getByRole('button', { name: '✕' });
    await closeButton.waitFor({ state: 'visible' });
    await closeButton.click();

    await expect(authModal).toBeHidden();
  });

  test('/login opens the auth modal and closing it returns to home', async ({
    page,
  }) => {
    await gotoLogin(page);
    const authModal = page
      .locator('div')
      .filter({
        has: page.getByRole('heading', { name: 'Sign in or create an account' }),
      })
      .nth(0);
    await authModal.waitFor({ state: 'visible' });

    const closeButton = authModal.getByRole('button', { name: '✕' });
    await closeButton.waitFor({ state: 'visible' });
    await closeButton.click();

    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL('/');
    await expect(
      page.locator('main').first().getByRole('heading', {
        name: 'SoundCloud',
        exact: true,
      })
    ).toBeVisible();
  });
});
