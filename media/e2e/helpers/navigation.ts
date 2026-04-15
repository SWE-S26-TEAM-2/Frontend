import { expect, type Page } from '@playwright/test';

async function waitForInteractive(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {});
}

export async function gotoHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForInteractive(page);
  await expect(
    page.locator('main').first().getByRole('heading', {
      name: 'SoundCloud',
      exact: true,
    })
  ).toBeVisible();
}

export async function gotoLogin(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await waitForInteractive(page);
  await expect(
    page.getByText('Sign in or create an account', { exact: true })
  ).toBeVisible();
}

export async function gotoSettings(page: Page, section: string) {
  await page.goto(`/settings/${section}`, { waitUntil: 'domcontentloaded' });
  await waitForInteractive(page);
  await expect(page).toHaveURL(`/settings/${section}`);
  await expect(
    page.locator('main').first().getByRole('heading', {
      name: 'Settings',
      exact: true,
    })
  ).toBeVisible();
}

export async function gotoProfile(page: Page, username: string) {
  await page.goto(`/${username}`, { waitUntil: 'domcontentloaded' });
  await waitForInteractive(page);
  await expect(
    page.getByRole('button', { name: 'All', exact: true })
  ).toBeVisible();
}
