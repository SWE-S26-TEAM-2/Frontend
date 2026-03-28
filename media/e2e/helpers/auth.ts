import type { Page } from '@playwright/test';

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

