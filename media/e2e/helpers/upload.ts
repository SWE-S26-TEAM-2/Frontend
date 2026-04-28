import { expect, type Page } from '@playwright/test';
import { UPLOAD_SELECTORS } from '../selectors/upload.selectors';

const UPLOAD_ROUTE = '/creator/upload';

export function buildAudioFixture(
  name: string,
  mimeType: string = 'audio/mpeg'
) {
  return {
    name,
    mimeType,
    buffer: Buffer.from(`fake-audio-${name}`),
  };
}

export function buildImageFixture(
  name: string,
  mimeType: string = 'image/png'
) {
  return {
    name,
    mimeType,
    buffer: Buffer.from(`fake-image-${name}`),
  };
}

export async function gotoUpload(page: Page) {
  await page.goto(UPLOAD_ROUTE, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page).toHaveURL(UPLOAD_ROUTE);
  await expect(page.locator(UPLOAD_SELECTORS.PAGE_HEADING)).toBeVisible();
  await expect(page.locator(UPLOAD_SELECTORS.DROPZONE)).toBeVisible();
}

export async function selectUploadAudioFile(page: Page, fileName: string) {
  await page
    .locator(UPLOAD_SELECTORS.FILE_INPUT)
    .first()
    .setInputFiles(buildAudioFixture(fileName));
}

export async function dragAndDropUploadAudioFile(page: Page, fileName: string) {
  const dataTransfer = await page.evaluateHandle(
    ({ name, mimeType, content }) => {
      const dt = new DataTransfer();
      dt.items.add(new File([content], name, { type: mimeType }));
      return dt;
    },
    {
      name: fileName,
      mimeType: 'audio/mpeg',
      content: `drag-drop-audio-${fileName}`,
    }
  );

  const dropzone = page.locator(UPLOAD_SELECTORS.DROPZONE);
  await expect(dropzone).toBeVisible();
  await dropzone.dispatchEvent('dragover', { dataTransfer });
  await dropzone.dispatchEvent('drop', { dataTransfer });
}

export async function goToUploadMetadataStep(
  page: Page,
  fileName: string = 'test-upload.mp3'
) {
  await gotoUpload(page);
  await selectUploadAudioFile(page, fileName);
  await expect(page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING)).toBeVisible();
  await expect(page.getByText(fileName, { exact: true })).toBeVisible();
  await expect(page.locator(UPLOAD_SELECTORS.TITLE_INPUT)).toBeVisible();
}

export async function submitUpload(page: Page) {
  const uploadButton = page.locator(UPLOAD_SELECTORS.UPLOAD_BUTTON);

  await expect(uploadButton).toBeVisible();
  await expect(uploadButton).toBeEnabled();

  // Try to place it better in view first
  await uploadButton.scrollIntoViewIfNeeded();
  await uploadButton.evaluate((el) =>
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
  );

  // Use keyboard activation to avoid sticky footer intercepting pointer events
  await uploadButton.focus();
  await expect(uploadButton).toBeFocused();
  await uploadButton.press('Enter');
}

export async function selectArtworkImage(page: Page, fileName: string) {
  await page
    .locator(UPLOAD_SELECTORS.ARTWORK_INPUT)
    .setInputFiles(buildImageFixture(fileName));
}

export async function waitForUploadSuccess(page: Page) {
  await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toBeVisible();
  await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_TEXT)).toBeVisible();
  await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_CTA)).toBeVisible();
}
