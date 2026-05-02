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
    const modalHeading = page.getByText('Sign in or create an account', {
      exact: true,
    });

    await expect(
      landingPage.getByRole('button', { name: 'Explore trending playlists' })
    ).toBeVisible();
    await expect(landingPage.getByRole('heading', { level: 1 })).toContainText(
      'Thanks for listening'
    );

    const signInButton = landingPage.getByRole('button', { name: 'Sign in' }).first();
    await expect(signInButton).toBeVisible();
    await signInButton.click();

    await expect(modalHeading).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Continue with Facebook' })
    ).toBeVisible();
    // Google uses an aria-hidden surface button when NEXT_PUBLIC_USE_MOCK_API is false;
    // assert by visible label instead of role.
    await expect(
      page.getByText('Continue with Google', { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Continue with Apple' })
    ).toBeVisible();
    await expect(
      page.getByPlaceholder('Your email address or profile URL')
    ).toBeVisible();

    const closeButton = page.getByRole('button', { name: '✕' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(modalHeading).toBeHidden();
  });

  test('/login opens the auth modal and closing it returns to home', async ({
    page,
  }) => {
    await gotoLogin(page);
    const closeButton = page.getByRole('button', { name: '✕' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL('/');
    const main = page.locator('main').first();
    await expect(
      main.getByRole('button', { name: 'Explore trending playlists' })
    ).toBeVisible();
    await expect(main.getByRole('heading', { level: 1 })).toContainText(
      'Thanks for listening'
    );
  });
});