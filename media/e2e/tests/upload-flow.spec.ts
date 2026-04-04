import { expect, test } from '@playwright/test';
import {
  goToUploadMetadataStep,
  gotoUpload,
  submitUpload,
  waitForUploadSuccess,
} from '../helpers/upload';
import { UPLOAD_SELECTORS } from '../selectors/upload.selectors';

test.describe('@critical Upload Flow', () => {
  test('direct route smoke on /creator/upload', async ({ page }) => {
    await gotoUpload(page);

    await expect(page.locator(UPLOAD_SELECTORS.PAGE_HEADING)).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.DROPZONE)).toBeVisible();
    await expect(page.getByText('Or record with a microphone')).toBeVisible();
  });

  test('valid upload flow reaches the success confirmation screen', async ({
    page,
  }) => {
    await goToUploadMetadataStep(page, 'valid-upload.mp3');

    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('Playwright Upload Track');
    await page.locator(UPLOAD_SELECTORS.ARTIST_INPUT).fill('QA Artist');
    await page.locator(UPLOAD_SELECTORS.GENRE_SELECT).first().selectOption('Electronic');
    await page.locator(UPLOAD_SELECTORS.TAGS_INPUT).fill('qa, upload');
    await page
      .locator(UPLOAD_SELECTORS.DESCRIPTION_INPUT)
      .fill('Verifies the implemented upload success path.');

    await submitUpload(page);

    await expect(page.getByRole('button', { name: /\d+%/ })).toBeDisabled();
    await waitForUploadSuccess(page);
  });

  test('duplicate submit prevention while upload is in progress', async ({
    page,
  }) => {
    let uploadCallCount = 0;
    page.on('console', (message) => {
      if (message.text().includes('[MOCK] uploadTrack called')) {
        uploadCallCount += 1;
      }
    });

    await goToUploadMetadataStep(page, 'duplicate-submit.mp3');
    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('Duplicate Guard');

    const uploadButton = page.getByRole('button', { name: 'Upload', exact: true });
    await Promise.allSettled([
      uploadButton.click(),
      uploadButton.click(),
      uploadButton.click(),
    ]);

    const progressButton = page.getByRole('button', { name: /\d+%/ });
    await expect(progressButton).toBeVisible();
    await expect(progressButton).toBeDisabled();

    await waitForUploadSuccess(page);
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toHaveCount(1);
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_CTA)).toHaveCount(1);
    expect(uploadCallCount).toBe(1);
  });

  test('success confirmation screen shows confirmation copy and CTA', async ({
    page,
  }) => {
    await goToUploadMetadataStep(page, 'success-cta.mp3');
    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('Success CTA Track');

    await submitUpload(page);
    await waitForUploadSuccess(page);

    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toHaveText(
      'Saved to SoundCloud.'
    );
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_CTA)).toBeVisible();
  });
});
