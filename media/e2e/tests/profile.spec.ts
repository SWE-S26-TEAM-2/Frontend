import { expect, test } from '@playwright/test';
import { gotoProfile } from '../helpers/navigation';
import { skipIfDeployProfileSlugMissing, TEST_USERS } from '../helpers/profile';

const useRealEnv = process.env.USE_REAL_ENV === 'true';

test.describe('Profile pages', () => {
  test('public artist profile loads with tracks and social sections', async ({
    page,
  }, testInfo) => {
    skipIfDeployProfileSlugMissing(testInfo, 'artist');
    await gotoProfile(page, TEST_USERS.artist);
    await expect(
      page.getByRole('button', { name: 'All', exact: true })
    ).toBeVisible();

    if (useRealEnv) {
      await expect(page.getByRole('heading', { name: 'Recent' })).toBeVisible();
      const trackCount = await page
        .locator('[data-testid="track-card"]')
        .count();
      if (trackCount === 0) {
        await expect(
          page.getByText('Seems a little quiet over here')
        ).toBeVisible();
      } else {
        await expect(page.locator('[data-testid="track-card"]').first()).toBeVisible();
      }
      return;
    }

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
  }, testInfo) => {
    skipIfDeployProfileSlugMissing(testInfo, 'owner');
    await gotoProfile(page, TEST_USERS.owner);
    const avatar = page.locator('div.group.rounded-full').first();
    await avatar.hover();
    await expect(avatar.getByText('Update')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Upload header image' })
    ).toBeVisible();
    if (useRealEnv) {
      await expect(
        page.getByRole('heading', { name: 'Recent' })
      ).toBeVisible();
      return;
    }
    await expect(
      page.getByText('Seems a little quiet over here')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Upload now' })
    ).toBeVisible();
  });

  test('profile tabs switch between implemented visible states', async ({
    page,
  }, testInfo) => {
    skipIfDeployProfileSlugMissing(testInfo, 'artist');
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
    if (useRealEnv) {
      await expect(
        page
          .getByText('No playlists yet')
          .or(page.locator('a[href^="/playlist/"]').first())
      ).toBeVisible({ timeout: 15000 });
    } else {
      await expect(page.getByText('No playlists yet')).toBeVisible();
    }

    await popularTracksTab.click();
    await expect(
      page.getByRole('heading', { name: 'Popular tracks' })
    ).toBeVisible();
    if (!useRealEnv) {
      await expect(
        page.getByText(/Une vie à t['’]aimer/i).first()
      ).toBeVisible();
    }

    await repostsTab.click();
    if (useRealEnv) {
      await expect(
        page.getByRole('heading', { name: 'Reposts' })
      ).toBeVisible();
    } else {
      await expect(
        page.getByText('Seems a little quiet over here')
      ).toBeVisible();
    }
  });
});
