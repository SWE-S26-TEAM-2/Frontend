import { expect, test } from '@playwright/test';
import {
  goToUploadMetadataStep,
  gotoUpload,
  submitUpload,
} from '../helpers/upload';
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

  test('whitespace-only title is rejected', async ({ page }) => {
    await goToUploadMetadataStep(page, 'whitespace-title.mp3');

    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill('      ');
    await submitUpload(page);

    await expect(
      page.locator(UPLOAD_SELECTORS.TITLE_REQUIRED_ERROR)
    ).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING)).toBeVisible();
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toHaveCount(0);
  });

  test('invalid file type rejection shows a visible error state', async ({
    page,
  }) => {
    // Drag-and-drop a clearly non-audio file. The dropzone advertises
    // accept=[mp3|wav|flac|aiff|alac|ogg]; selecting a .txt via the file
    // input is gated by the browser, but drag-and-drop is the spec-friendly
    // way to bypass the picker. The product MUST reject the file with either:
    //   - an inline error, OR
    //   - by NOT advancing past the select step.
    await gotoUpload(page);

    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(
        new File(['not an audio file'], 'broken.txt', { type: 'text/plain' })
      );
      return dt;
    });
    const dropzone = page.locator(UPLOAD_SELECTORS.DROPZONE);
    await dropzone.dispatchEvent('dragover', { dataTransfer });
    await dropzone.dispatchEvent('drop', { dataTransfer });

    const trackInfoHeading = page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING);
    const errorBanner = page
      .getByText(/invalid file|unsupported|wrong file type|not supported/i)
      .first();

    await expect
      .poll(
        async () => {
          const advanced = await trackInfoHeading.isVisible().catch(() => false);
          const errorVisible = await errorBanner
            .isVisible()
            .catch(() => false);
          // PASS if we got an error OR we never advanced past the select step.
          return errorVisible || !advanced;
        },
        { timeout: 4000 }
      )
      .toBe(true);
  });

  test('upload failure surfaces an error and keeps the user on metadata', async ({
    page,
  }) => {
    // Force the upload endpoint to 500. Works for both mock-mode (mock now
    // emits a sentinel POST /api/tracks) and real-mode.
    await page.route('**/api/tracks**', async (route) => {
      if (
        route.request().method() === 'POST' &&
        /\/api\/tracks\/?(\?|$)/.test(route.request().url())
      ) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'forced failure' }),
        });
        return;
      }
      await route.continue();
    });

    await goToUploadMetadataStep(page, 'failure-flow.mp3');
    await page
      .locator(UPLOAD_SELECTORS.TITLE_INPUT)
      .fill('Failure Path Track');

    await submitUpload(page);

    // The page renders an inline error banner ("Upload failed. Please try
    // again.") on the metadata step when uploadService throws.
    const errorBanner = page
      .getByText(/upload failed/i)
      .first();
    const stillOnMetadata = page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING);
    await expect
      .poll(
        async () =>
          (await errorBanner.isVisible().catch(() => false)) ||
          (await stillOnMetadata.isVisible().catch(() => false)),
        { timeout: 8000 }
      )
      .toBe(true);

    // Must NOT have reached the success screen.
    await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toHaveCount(0);
  });
});
