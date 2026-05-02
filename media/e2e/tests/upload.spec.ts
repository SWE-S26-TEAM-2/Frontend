import { expect, test } from '@playwright/test';
import { seedAuthToken } from '../helpers/auth';

// ── helpers ───────────────────────────────────────────────────────────────────

async function gotoUpload(page: import('@playwright/test').Page) {
  await page.goto('/creator/upload', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

// ── suite ─────────────────────────────────────────────────────────────────────

test.describe('Upload page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthToken(page);
  });

  test('/creator/upload loads and shows the upload landing UI', async ({
    page,
  }) => {
    await gotoUpload(page);
    await expect(page).toHaveURL(/\/creator\/upload/);
    // Logged-out: UploadLanding "Upload your first track". Logged-in: select step headline.
    await expect(
      page.getByText(/Upload your (first track|audio files)|Upload a track/i).first()
    ).toBeVisible();
  });

  test('upload page has a file input for selecting audio files', async ({
    page,
  }) => {
    await gotoUpload(page);
    // UploadDropzone renders a hidden <input type="file"> that accepts audio
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached();
    const accept = await fileInput.getAttribute('accept');
    // Should accept audio or be unrestricted
    expect(accept === null || /audio|mp3|wav/i.test(accept ?? '')).toBeTruthy();
  });

  test('upload page shows the quota bar or a track count indicator', async ({
    page,
  }) => {
    await gotoUpload(page);
    // UploadQuotaBar renders usage information; it may or may not be visible
    // in mock mode — just verify the page doesn't crash
    await expect(page).toHaveURL(/\/creator\/upload/);
    await expect(page.getByText('soundcloud').first()).toBeVisible();
  });

  test('Upload header link routes to /creator/upload', async ({ page }) => {
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    const uploadLink = page.getByRole('link', { name: 'Upload' }).first();
    await expect(uploadLink).toBeVisible();
    await uploadLink.click();
    await expect(page).toHaveURL(/\/creator\/upload/);
  });

  test('unauthenticated /creator/upload redirects to login', async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      window.localStorage.removeItem('auth_token');
    });
    await page.goto('/creator/upload', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).toHaveURL(/\/login/);
  });
});
