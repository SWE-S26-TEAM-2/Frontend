import { expect, test } from '@playwright/test';
import { goToUploadMetadataStep, submitUpload } from '../helpers/upload';
import { UPLOAD_SELECTORS } from '../selectors/upload.selectors';

test.describe('@high Upload Validation', () => {
  test('required title validation blocks submit', async ({ page }) => {
    await goToUploadMetadataStep(page, 'missing-title.mp3');

    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('   ');
    await page.locator(UPLOAD_SELECTORS.ARTIST_INPUT).fill('Validation Artist');
    await page.locator(UPLOAD_SELECTORS.GENRE_SELECT).first().selectOption('Electronic');
    await page.locator(UPLOAD_SELECTORS.TAGS_INPUT).fill('validation, upload');
    await page
      .locator(UPLOAD_SELECTORS.DESCRIPTION_INPUT)
      .fill('Other metadata is filled, but title is still required.');

    await submitUpload(page);

    await expect(
      page.locator(UPLOAD_SELECTORS.TITLE_REQUIRED_ERROR)
    ).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING)).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toHaveCount(0);
  });

  test.skip('invalid file type rejection shows a visible error state', async () => {
    // Invalid file rejection is not implemented with a visible UI error state in the current upload flow.
  });

  test.skip(
    'upload failure shows a visible error state and keeps the user on metadata',
    async () => {
      // Current Playwright setup uses a mock upload service with no built-in failure toggle.
    }
  );
});
