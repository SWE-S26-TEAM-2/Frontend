import { expect, test, type Page } from '@playwright/test';
import { gotoProfile } from '../helpers/navigation';
import { TEST_USERS } from '../helpers/profile';

function profilePage(page: Page) {
  return page
    .locator('body > div')
    .filter({
      has: page.getByRole('button', { name: 'All' }).first(),
    })
    .first();
}

test.describe('Profile pages', () => {
  test('public artist profile loads with tracks and social sections', async ({
    page,
  }) => {
    await gotoProfile(page, TEST_USERS.artist);
    const profile = profilePage(page);
    await profile.waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(profile.getByText('NEW ALBUM SOON')).toBeVisible();
    await expect(
      profile.getByRole('button', { name: /Follow/i }).nth(0)
    ).toBeVisible();
    await expect(profile.getByText(/FANS ALSO LIKE/i)).toBeVisible();
    await expect(profile.getByRole('heading', { name: 'Recent' })).toBeVisible();
    await expect(profile.getByText(/Une vie à t['’]aimer/i)).toBeVisible();
  });

  test('owner profile loads with the current empty-state experience', async ({
    page,
  }) => {
    await gotoProfile(page, TEST_USERS.owner);
    const profile = profilePage(page);
    await profile.waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(
      profile.getByRole('button', { name: 'Upload image' })
    ).toBeVisible();
    await expect(
      profile.getByRole('button', { name: 'Upload header image' })
    ).toBeVisible();
    await expect(
      profile.getByText('Seems a little quiet over here')
    ).toBeVisible();
    await expect(profile.getByRole('button', { name: 'Upload now' })).toBeVisible();
  });

  test('profile tabs switch between implemented visible states', async ({
    page,
  }) => {
    await gotoProfile(page, TEST_USERS.artist);
    const profile = profilePage(page);
    const tabList = profile.locator('button');
    await profile.waitFor({ state: 'visible' });
    await tabList.filter({ hasText: 'Playlists' }).first().waitFor({
      state: 'visible',
    });

    await tabList.filter({ hasText: 'Playlists' }).first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(profile.getByText('No playlists yet')).toBeVisible();

    await tabList.filter({ hasText: 'Popular tracks' }).first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(
      profile.getByRole('heading', { name: 'Popular tracks' })
    ).toBeVisible();
    await expect(profile.getByText(/Une vie à t['’]aimer/i)).toBeVisible();

    await tabList.filter({ hasText: 'Reposts' }).first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(
      profile.getByText('Seems a little quiet over here')
    ).toBeVisible();
  });
});
