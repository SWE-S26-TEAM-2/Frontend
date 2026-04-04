import { expect, type Page } from '@playwright/test';
import { LOGIN_SELECTORS } from '../selectors/login.selectors';
import { AUTH_SELECTORS } from '../selectors/auth.selectors';

export const AUTH_FIXTURES = {
  existingEmail: 'test@example.com',
  existingProfileUrl: 'soundcloud.com/testuser',
  newEmail: 'newuser@example.com',
  newProfileUrl: 'soundcloud.com/new-artist',
  validPassword: 'pass123',
} as const;

export async function seedAuthToken(
  page: Page,
  token: string = 'fake-e2e-token'
) {
  await page.addInitScript((seededToken) => {
    window.localStorage.setItem('auth_token', seededToken);
  }, token);
}

export async function clearAuthState(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.removeItem('auth_token');
  });
}

/**
 * Opens the login modal from the landing page header.
 */
export async function openLoginModal(page: Page) {
  const signInButton = page
    .locator(AUTH_SELECTORS.LANDING_SIGN_IN_BUTTON)
    .first();
  await signInButton.waitFor({ state: 'visible' });
  await signInButton.click();
  await expect(page.getByText('Sign in or create an account')).toBeVisible();
}

/**
 * Fills the email input in the login modal.
 */
export async function fillEmailInput(page: Page, email: string) {
  const emailInput = page.locator(LOGIN_SELECTORS.EMAIL_INPUT);
  await emailInput.waitFor({ state: 'visible' });
  await emailInput.fill(email);
  return emailInput;
}

/**
 * Clicks the Continue button in the login modal and waits for step transition.
 * Waits for either:
 * - Password input to become visible (valid email → next step)
 * - Error text to appear (invalid email → stays on same step)
 */
export async function clickContinue(page: Page) {
  const continueButton = page.locator(LOGIN_SELECTORS.CONTINUE_BUTTON).first();
  await continueButton.click();

  // Wait for a state transition: either password step OR error message
  const passwordInput = page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).first();
  const errorText = page.locator('text=/Please enter|Invalid|error/i').first();
  const welcomeBack = page.getByText('Welcome back!');
  const createAccount = page.getByText('Create an account');

  // Wait for any of: password input, error message, or step title change
  await Promise.race([
    passwordInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
    errorText.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
    welcomeBack.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
    createAccount.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
  ]);
}

/**
 * Fills the password input (works for both sign in and register).
 */
export async function fillPasswordInput(page: Page, password: string) {
  const passwordInput = await waitForPasswordStep(page);
  await passwordInput.fill(password);
  return passwordInput;
}

/**
 * Waits for the auth flow to render either the sign-in or register password step.
 */
export async function waitForPasswordStep(page: Page) {
  const passwordInput = page.locator(LOGIN_SELECTORS.PASSWORD_INPUT).first();

  await expect(async () => {
    const signInVisible = await page
      .getByText('Welcome back!', { exact: true })
      .isVisible()
      .catch(() => false);
    const registerVisible = await page
      .getByText('Create an account', { exact: true })
      .isVisible()
      .catch(() => false);
    const passwordVisible = await passwordInput.isVisible().catch(() => false);

    expect(signInVisible || registerVisible).toBe(true);
    expect(passwordVisible).toBe(true);
  }).toPass({ timeout: 7000 });

  return passwordInput;
}

/**
 * Closes the login modal via the X button.
 */
export async function closeLoginModal(page: Page) {
  const closeButton = page.locator(LOGIN_SELECTORS.CLOSE_BUTTON);
  await closeButton.click();
  await expect(page.getByText('Sign in or create an account')).toBeHidden();
}

/**
 * Checks if the login modal is currently visible.
 */
export async function isLoginModalVisible(page: Page): Promise<boolean> {
  return page.getByText('Sign in or create an account').isVisible();
}

/**
 * Gets the current auth token from localStorage.
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem('auth_token'));
}

/**
 * Opens the avatar dropdown menu (requires authenticated state).
 */
export async function openAvatarDropdown(page: Page) {
  const avatarButton = page.locator(AUTH_SELECTORS.HEADER_AVATAR_BUTTON);
  await avatarButton.click();
  await expect(page.locator(AUTH_SELECTORS.DROPDOWN_PROFILE)).toBeVisible();
}

/**
 * Opens the dots menu (More options).
 */
export async function openDotsMenu(page: Page) {
  const dotsButton = page.locator(AUTH_SELECTORS.DOTS_MENU_BUTTON);
  await dotsButton.click();
  await expect(page.getByText('Settings')).toBeVisible();
}
