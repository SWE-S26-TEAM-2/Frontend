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
  await uploadButton.evaluate((el) =>
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
  );
  await expect(uploadButton).toBeEnabled();
  await uploadButton.click();
}

export async function waitForUploadSuccess(page: Page) {
  await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING)).toBeVisible();
  await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_TEXT)).toBeVisible();
  await expect(page.locator(UPLOAD_SELECTORS.SUCCESS_CTA)).toBeVisible();
}
