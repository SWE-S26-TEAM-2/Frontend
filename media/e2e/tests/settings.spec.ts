import { expect, test, type Page } from '@playwright/test';
import { gotoSettings } from '../helpers/navigation';

function rgbaToRgb(color: string): string {
  return color.replace('rgba', 'rgb').replace(/,\s*1\)/, ')');
}

function settingsMain(page: Page) {
  return page.locator('main').first();
}

function settingsShell(page: Page) {
  return settingsMain(page)
    .locator('div')
    .filter({
      has: settingsMain(page).getByRole('heading', { name: 'Settings' }),
    })
    .first();
}

function settingsTabs(page: Page) {
  return settingsShell(page).locator('a');
}

async function waitForSettingsReady(page: Page, anchor: ReturnType<Page['locator']>) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await anchor.waitFor({ state: 'visible' });
}

async function getToggleInSection(page: Page, title: string) {
  const section = settingsMain(page)
    .locator('div')
    .filter({
      has: settingsMain(page).getByRole('heading', { name: title }),
    })
    .first();

  return section.getByRole('button').first();
}

test.describe('Settings pages', () => {
  test('/settings redirects to account settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveURL('/settings/account');
    await expect(
      settingsShell(page).getByRole('heading', { name: 'Settings' })
    ).toBeVisible();
    await expect(
      settingsMain(page).getByRole('heading', { name: 'Change theme' })
    ).toBeVisible();
  });

  test('settings tabs navigate between implemented sections', async ({ page }) => {
    await gotoSettings(page, 'account');

    const contentTab = settingsTabs(page).filter({ hasText: 'Content' }).first();
    await contentTab.waitFor({ state: 'visible' });
    await contentTab.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL('/settings/content');
    await expect(
      settingsMain(page).getByRole('heading', { name: 'RSS feed' })
    ).toBeVisible();

    const notificationsTab = settingsTabs(page)
      .filter({ hasText: 'Notifications' })
      .first();
    await notificationsTab.waitFor({ state: 'visible' });
    await notificationsTab.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL('/settings/notifications');
    await expect(
      settingsMain(page).getByText('Activities', { exact: true })
    ).toBeVisible();

    const privacyTab = settingsTabs(page).filter({ hasText: 'Privacy' }).first();
    await privacyTab.waitFor({ state: 'visible' });
    await privacyTab.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL('/settings/privacy');
    await expect(
      settingsMain(page).getByRole('heading', { name: 'Privacy settings' })
    ).toBeVisible();

    const advertisingTab = settingsTabs(page)
      .filter({ hasText: 'Advertising' })
      .first();
    await advertisingTab.waitFor({ state: 'visible' });
    await advertisingTab.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL('/settings/advertising');
    await expect(
      settingsMain(page).getByRole('heading', { name: 'Advertising Settings' })
    ).toBeVisible();

    const twoFactorTab = settingsTabs(page).filter({ hasText: '2FA' }).first();
    await twoFactorTab.waitFor({ state: 'visible' });
    await twoFactorTab.click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL('/settings/two-factor');
    await expect(
      settingsMain(page).getByText('Status', { exact: true })
    ).toBeVisible();
  });

  test('privacy auth page loads and allows toggling a setting', async ({
    page,
  }) => {
    await gotoSettings(page, 'privacy/auth');
    const privacyHeading = settingsMain(page).getByRole('heading', {
      name: 'Privacy settings',
    });
    await waitForSettingsReady(page, privacyHeading);

    await expect(
      privacyHeading
    ).toBeVisible();

    const toggle = await getToggleInSection(
      page,
      'Receive messages from anyone'
    );
    await toggle.waitFor({ state: 'visible' });

    const before = await toggle.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    await toggle.click();

    await expect
      .poll(async () =>
        toggle.evaluate((el) => getComputedStyle(el).backgroundColor)
      )
      .not.toBe(rgbaToRgb(before));
  });

  test('privacy main page loads and allows toggling a setting', async ({
    page,
  }) => {
    await gotoSettings(page, 'privacy');
    const toggle = await getToggleInSection(
      page,
      "Show when I'm a First or Top Fan"
    );
    await toggle.waitFor({ state: 'visible' });

    const before = await toggle.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    await toggle.click();

    await expect
      .poll(async () =>
        toggle.evaluate((el) => getComputedStyle(el).backgroundColor)
      )
      .not.toBe(rgbaToRgb(before));
  });

  test('account settings let the user change theme selection', async ({
    page,
  }) => {
    await gotoSettings(page, 'account');

    const themeSection = settingsMain(page)
      .locator('div')
      .filter({
        has: settingsMain(page).getByRole('heading', { name: 'Change theme' }),
      })
      .first();
    const lightTheme = themeSection.getByRole('radio').nth(0);
    const darkTheme = themeSection.getByRole('radio').nth(1);
    await themeSection.waitFor({ state: 'visible' });
    await darkTheme.waitFor({ state: 'visible' });
    await lightTheme.waitFor({ state: 'visible' });

    await expect(darkTheme).toBeChecked();
    await lightTheme.check();
    await expect(lightTheme).toBeChecked();
  });

  test('notifications settings allow updating row controls', async ({ page }) => {
    await gotoSettings(page, 'notifications');

    const notificationsPage = settingsMain(page);
    const newFollowerRow = notificationsPage
      .locator('div')
      .filter({
        has: notificationsPage.getByText('New follower', { exact: true }),
      })
      .first();
    const checkboxes = newFollowerRow.getByRole('checkbox');
    await newFollowerRow.waitFor({ state: 'visible' });
    await checkboxes.nth(0).waitFor({ state: 'visible' });

    await expect(checkboxes.nth(0)).not.toBeChecked();
    await checkboxes.nth(0).check();
    await expect(checkboxes.nth(0)).toBeChecked();

    const newMessageRow = notificationsPage
      .locator('div')
      .filter({
        has: notificationsPage.getByText('New message', { exact: true }),
      })
      .first();
    const audienceSelect = newMessageRow.locator('select');
    await newMessageRow.waitFor({ state: 'visible' });
    await audienceSelect.waitFor({ state: 'visible' });

    await expect(audienceSelect).toHaveValue('Everyone');
    await audienceSelect.selectOption('Following');
    await expect(audienceSelect).toHaveValue('Following');
  });

  test('content settings allow editing implemented form fields', async ({
    page,
  }) => {
    await gotoSettings(page, 'content');

    const contentPage = settingsMain(page);
    const authorNameInput = contentPage
      .locator('div')
      .filter({
        has: contentPage.getByText('Custom author name', { exact: true }),
      })
      .locator('input')
      .first();
    const explicitContentCheckbox = contentPage.getByRole('checkbox').first();
    await authorNameInput.waitFor({ state: 'visible' });
    await explicitContentCheckbox.waitFor({ state: 'visible' });

    await authorNameInput.fill('QA Feed Title');
    await expect(authorNameInput).toHaveValue('QA Feed Title');

    await expect(explicitContentCheckbox).not.toBeChecked();
    await explicitContentCheckbox.check();
    await expect(explicitContentCheckbox).toBeChecked();
  });

  test('two-factor settings allow enabling 2FA', async ({ page }) => {
    await gotoSettings(page, 'two-factor');

    const twoFactorPage = settingsMain(page);
    const toggleButton = twoFactorPage.getByRole('button', {
      name: 'Enable Two-Factor Auth (2FA)',
    });
    await toggleButton.waitFor({ state: 'visible' });

    await toggleButton.click();
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(
      twoFactorPage.getByRole('button', {
        name: 'Disable Two-Factor Auth (2FA)',
      })
    ).toBeVisible();
    await expect(
      twoFactorPage.getByText('Two-Factor Authentication is enabled')
    ).toBeVisible();
  });
});
