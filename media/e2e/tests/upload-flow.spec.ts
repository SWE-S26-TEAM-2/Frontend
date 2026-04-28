import { expect, test } from '@playwright/test';
import {
  dragAndDropUploadAudioFile,
  goToUploadMetadataStep,
  gotoUpload,
  selectArtworkImage,
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

    await page
      .locator(UPLOAD_SELECTORS.TITLE_INPUT)
      .fill('Playwright Upload Track');
    await page.locator(UPLOAD_SELECTORS.ARTIST_INPUT).fill('QA Artist');
    await page
      .locator(UPLOAD_SELECTORS.GENRE_SELECT)
      .first()
      .selectOption('Electronic');
    await page.locator(UPLOAD_SELECTORS.TAGS_INPUT).fill('qa, upload');
    await page
      .locator(UPLOAD_SELECTORS.DESCRIPTION_INPUT)
      .fill('Verifies the implemented upload success path.');

    await submitUpload(page);

    await expect(page.getByRole('button', { name: /\d+%/ })).toBeDisabled();
    await waitForUploadSuccess(page);
  });

  test('drag-and-drop upload advances to metadata step', async ({ page }) => {
    await gotoUpload(page);
    await dragAndDropUploadAudioFile(page, 'dragged-upload.mp3');

    await expect(page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING)).toBeVisible();
    await expect(page.getByText('dragged-upload.mp3', { exact: true })).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.TITLE_INPUT)).toHaveValue(
      'dragged-upload'
    );
  });

  test('duplicate submit prevention while upload is in progress', async ({
    page,
  }) => {
    // Network-level interception: count POST /api/tracks attempts. In mock
    // mode the mock service emits a sentinel POST so this still fires; in
    // real mode the actual upload hits the same path.
    let uploadRequestCount = 0;
    await page.route('**/api/tracks**', async (route) => {
      if (
        route.request().method() === 'POST' &&
        /\/api\/tracks\/?(\?|$)/.test(route.request().url())
      ) {
        uploadRequestCount += 1;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await goToUploadMetadataStep(page, 'duplicate-submit.mp3');
    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('Duplicate Guard');

    await submitUpload(page);

    const progressButton = page.getByRole('button', { name: /\d+%/ });
    await expect(progressButton).toBeVisible();
    await expect(progressButton).toBeDisabled();

    await waitForUploadSuccess(page);
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toHaveCount(1);
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_CTA)).toHaveCount(1);

    // Exactly ONE upload attempt - the duplicate-submit guard MUST prevent
    // a second POST while the first is in-flight.
    expect(uploadRequestCount).toBe(1);
  });

  test('replace track returns to select step', async ({ page }) => {
    await goToUploadMetadataStep(page, 'replace-me.mp3');

    await page.locator(UPLOAD_SELECTORS.REPLACE_TRACK_BUTTON).click();

    await expect(page.locator(UPLOAD_SELECTORS.PAGE_HEADING)).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.DROPZONE)).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING)).toHaveCount(0);
  });

  test('quit-upload confirmation modal flow', async ({ page }) => {
    await goToUploadMetadataStep(page, 'quit-flow.mp3');
    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('Keep This Draft');

    await page.locator(UPLOAD_SELECTORS.CLOSE_UPLOAD_BUTTON).click();
    await expect(
      page.locator(UPLOAD_SELECTORS.QUIT_CONFIRMATION_HEADING)
    ).toBeVisible();

    await page.locator(UPLOAD_SELECTORS.BACK_TO_UPLOAD_BUTTON).click();
    await expect(
      page.locator(UPLOAD_SELECTORS.QUIT_CONFIRMATION_HEADING)
    ).toHaveCount(0);
    await expect(page.locator(UPLOAD_SELECTORS.TITLE_INPUT)).toHaveValue(
      'Keep This Draft'
    );

    await page.locator(UPLOAD_SELECTORS.CLOSE_UPLOAD_BUTTON).click();
    await page.locator(UPLOAD_SELECTORS.QUIT_UPLOAD_BUTTON).click();
    await expect(page.locator(UPLOAD_SELECTORS.PAGE_HEADING)).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.DROPZONE)).toBeVisible();
  });

  test('artwork add/remove behavior', async ({ page }) => {
    await goToUploadMetadataStep(page, 'artwork-flow.mp3');

    await page.locator(UPLOAD_SELECTORS.ARTWORK_UPLOAD_BUTTON).click();
    await selectArtworkImage(page, 'cover.png');
    await expect(page.locator(UPLOAD_SELECTORS.ARTWORK_PREVIEW)).toBeVisible();
    await expect(
      page.locator(UPLOAD_SELECTORS.ARTWORK_REMOVE_BUTTON)
    ).toBeVisible();

    await page.locator(UPLOAD_SELECTORS.ARTWORK_REMOVE_BUTTON).click();
    await expect(page.locator(UPLOAD_SELECTORS.ARTWORK_PREVIEW)).toHaveCount(0);
    await expect(page.locator(UPLOAD_SELECTORS.ARTWORK_UPLOAD_BUTTON)).toBeVisible();
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

  test('second upload after one successful upload works', async ({ page }) => {
    await goToUploadMetadataStep(page, 'first-success.mp3');
    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('First Upload');
    await submitUpload(page);
    await waitForUploadSuccess(page);

    await page.locator(UPLOAD_SELECTORS.SUCCESS_CLOSE_BUTTON).click();
    await expect(page.locator(UPLOAD_SELECTORS.PAGE_HEADING)).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.DROPZONE)).toBeVisible();

    await dragAndDropUploadAudioFile(page, 'second-success.mp3');
    await expect(page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING)).toBeVisible();
    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('Second Upload');
    await submitUpload(page);

    await waitForUploadSuccess(page);
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toHaveText(
      'Saved to SoundCloud.'
    );
  });
});
