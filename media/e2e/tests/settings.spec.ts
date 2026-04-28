import { expect, test, type Page } from '@playwright/test';
import { gotoSettings } from '../helpers/navigation';
import { seedAuthToken } from '../helpers/auth';

function settingsMain(page: Page) {
  return page.locator('main').first();
}

function settingsHeading(page: Page) {
  return settingsMain(page).getByRole('heading', {
    name: 'Settings',
    exact: true,
  });
}

function settingsTab(page: Page, name: string) {
  return settingsMain(page).getByRole('link', { name, exact: true });
}
async function navigateToSettingsTab(
  page: Page,
  tabName: string,
  href: string
) {
  const tab = settingsTab(page, tabName);

  await expect(tab).toBeVisible();
  await expect(tab).toBeEnabled();
  await expect(tab).toHaveAttribute('href', href);

  await tab.scrollIntoViewIfNeeded();
  await tab.click({ trial: true });

  await Promise.all([page.waitForURL(`**${href}`), tab.click()]);

  await expect(page).toHaveURL(
    new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
  );
}

function sectionByHeading(page: Page, name: string) {
  return settingsMain(page)
    .getByText(name, { exact: true })
    .locator('xpath=..');
}

async function waitForSettingsReady(
  page: Page,
  anchor: ReturnType<Page['locator']>
) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await anchor.waitFor({ state: 'visible' });
}

async function getToggleInSection(page: Page, title: string) {
  // Prefer the explicit role=switch added to the Toggle component; fall back
  // to the legacy first-button selector if the section uses a non-Toggle
  // control (kept for forward-compat).
  const section = sectionByHeading(page, title);
  const switchControl = section.getByRole('switch').first();
  if (await switchControl.count()) return switchControl;
  return section.getByRole('button').first();
}

test.describe('Settings pages', () => {
  test.beforeEach(async ({ page }) => {
    // settings.spec.ts previously skipped seeding auth (inconsistent with
    // settings-state.spec.ts). Seed here so settings routes resolve uniformly.
    await seedAuthToken(page);
  });

  test('/settings redirects to account settings', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page).toHaveURL('/settings/account');
    await expect(settingsHeading(page)).toBeVisible();
    await expect(
      settingsMain(page).getByRole('heading', { name: 'Change theme' })
    ).toBeVisible();
  });

  test('settings tabs navigate between implemented sections', async ({
    page,
  }) => {
    await gotoSettings(page, 'account');

    await expect(
      settingsMain(page).getByRole('heading', {
        name: 'Change theme',
        exact: true,
      })
    ).toBeVisible();

    await navigateToSettingsTab(page, 'Content', '/settings/content');
    await expect(
      settingsMain(page).getByRole('heading', { name: 'RSS feed', exact: true })
    ).toBeVisible();
    await navigateToSettingsTab(page, 'Content', '/settings/content');

    const contentPage = settingsMain(page);
    const loadingText = contentPage.getByText('Loading...', { exact: true });
    const rssHeading = contentPage.getByRole('heading', {
      name: 'RSS feed',
      exact: true,
    });

    if (await loadingText.isVisible().catch(() => false)) {
      await loadingText.waitFor({ state: 'hidden', timeout: 10000 });
    }

    await expect(rssHeading).toBeVisible();
    await navigateToSettingsTab(
      page,
      'Notifications',
      '/settings/notifications'
    );
    await expect(
      settingsMain(page).getByText('Activities', { exact: true })
    ).toBeVisible();

    await navigateToSettingsTab(page, 'Privacy', '/settings/privacy');
    await expect(
      settingsMain(page).getByRole('heading', {
        name: 'Privacy settings',
        exact: true,
      })
    ).toBeVisible();

    await navigateToSettingsTab(page, 'Advertising', '/settings/advertising');
    await expect(
      settingsMain(page).getByRole('heading', {
        name: 'Advertising Settings',
        exact: true,
      })
    ).toBeVisible();

    await navigateToSettingsTab(page, '2FA', '/settings/two-factor');
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

    await expect(privacyHeading).toBeVisible();

    const toggle = await getToggleInSection(
      page,
      'Receive messages from anyone'
    );
    await toggle.waitFor({ state: 'visible' });

    const before = await toggle.getAttribute('aria-checked');
    await toggle.click();

    await expect(toggle).not.toHaveAttribute('aria-checked', before ?? '');
    await expect(toggle).toHaveAttribute('data-state', /^(on|off)$/);
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

    const before = await toggle.getAttribute('aria-checked');
    await toggle.click();

    await expect(toggle).not.toHaveAttribute('aria-checked', before ?? '');
  });

  test('account settings let the user change theme selection', async ({
    page,
  }) => {
    await gotoSettings(page, 'account');

    const lightTheme = settingsMain(page).getByRole('radio', {
      name: 'light',
      exact: true,
    });
    const darkTheme = settingsMain(page).getByRole('radio', {
      name: 'dark',
      exact: true,
    });
    await darkTheme.waitFor({ state: 'visible' });
    await lightTheme.waitFor({ state: 'visible' });

    await expect(darkTheme).toBeChecked();
    await lightTheme.check();
    await expect(lightTheme).toBeChecked();
  });

  test('notifications settings allow updating row controls', async ({
    page,
  }) => {
    await gotoSettings(page, 'notifications');

    const notificationsPage = settingsMain(page);
    const newFollowerRow = notificationsPage
      .getByText('New follower', { exact: true })
      .locator('xpath=..');
    const checkboxes = newFollowerRow.getByRole('checkbox');
    await newFollowerRow.waitFor({ state: 'visible' });
    await checkboxes.nth(0).waitFor({ state: 'visible' });

    await expect(checkboxes.nth(0)).not.toBeChecked();
    await checkboxes.nth(0).check();
    await expect(checkboxes.nth(0)).toBeChecked();

    const newMessageRow = notificationsPage
      .getByText('New message', { exact: true })
      .locator('xpath=..');
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
      .getByText('Custom author name', { exact: true })
      .locator('xpath=..')
      .locator('input')
      .first();
    const explicitContentCheckbox = contentPage.getByRole('checkbox', {
      name: 'Contains explicit content',
    });
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
