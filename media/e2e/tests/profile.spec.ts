import { expect, test, type Page } from '@playwright/test';
import { gotoProfile } from '../helpers/navigation';
import { TEST_USERS } from '../helpers/profile';

test.describe('Profile pages', () => {
  test('public artist profile loads with tracks and social sections', async ({
    page,
  }) => {
    await gotoProfile(page, TEST_USERS.artist);
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible();
    await expect(page.getByText('NEW ALBUM SOON')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^👤 Follow$/ }).first()
    ).toBeVisible();
    await expect(page.getByText(/FANS ALSO LIKE/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent' })).toBeVisible();
    await expect(page.getByText(/Une vie à t['’]aimer/i).first()).toBeVisible();
  });

  test('owner profile loads with the current empty-state experience', async ({
    page,
  }) => {
    await gotoProfile(page, TEST_USERS.owner);
    await expect(page.getByRole('button', { name: 'Upload image' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Upload header image' })
    ).toBeVisible();
    await expect(page.getByText('Seems a little quiet over here')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload now' })).toBeVisible();
  });

  test('profile tabs switch between implemented visible states', async ({
    page,
  }) => {
    await gotoProfile(page, TEST_USERS.artist);
    const playlistsTab = page.getByRole('button', {
      name: 'Playlists',
      exact: true,
    });
    const popularTracksTab = page.getByRole('button', {
      name: 'Popular tracks',
      exact: true,
    });
    const repostsTab = page.getByRole('button', {
      name: 'Reposts',
      exact: true,
    });

    await playlistsTab.click();
    await expect(page.getByText('No playlists yet')).toBeVisible();

    await popularTracksTab.click();
    await expect(
      page.getByRole('heading', { name: 'Popular tracks' })
    ).toBeVisible();
    await expect(page.getByText(/Une vie à t['’]aimer/i).first()).toBeVisible();

    await repostsTab.click();
    await expect(page.getByText('Seems a little quiet over here')).toBeVisible();
  });
});
