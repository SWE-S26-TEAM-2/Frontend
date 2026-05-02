import { expect, type Page } from '@playwright/test';

async function waitForInteractive(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {});
}

export async function gotoHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForInteractive(page);
  const main = page.locator('main').first();
  await expect(
    main.getByRole('button', { name: 'Explore trending playlists' })
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
  const allTab = page.getByRole('button', { name: 'All', exact: true });
  const profileError = page.getByText(/User not found|Something went wrong/);
  const privateProfile = page.getByText('This profile is private');
  await expect(
    allTab.or(profileError).or(privateProfile).first()
  ).toBeVisible({ timeout: 25000 });
  if (await profileError.isVisible().catch(() => false)) {
    throw new Error(
      `Profile "${username}" did not load (error or not found on this environment).`
    );
  }
  if (await privateProfile.isVisible().catch(() => false)) {
    throw new Error(
      `Profile "${username}" is private; use a public user for this test.`
    );
  }
  await expect(allTab).toBeVisible();
}
