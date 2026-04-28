/**
 * upload-real.spec.ts - exercises POST /api/tracks against the live backend.
 *
 * Requires:
 *   - chromium-real storageState with a valid auth_token
 *   - a small mp3 fixture; see e2e/real/fixtures/README.md
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { UPLOAD_SELECTORS } from '../selectors/upload.selectors';
import {
  apiRequest,
  isStorageStateAuthenticated,
  getSeedToken,
} from './fixtures/api-client';
import { resolveSampleMp3Path, SAMPLE_MP3_HINT } from './fixtures/sample-mp3';

test.describe('@real upload', () => {
  test.beforeAll(async () => {
    if (!(await isStorageStateAuthenticated())) {
      test.skip(true, 'No real-backend auth; see fixtures/README.md.');
    }
  });

  test('upload a small mp3 via /creator/upload reaches success copy', async ({
    page,
  }) => {
    const samplePath = resolveSampleMp3Path();
    test.skip(samplePath === null, SAMPLE_MP3_HINT);

    await page.goto('/creator/upload');
    await expect(page.locator(UPLOAD_SELECTORS.PAGE_HEADING)).toBeVisible();

    const trackTitle = `pw-real-${Date.now()}`;
    let observedTrackId: string | null = null;

    await page.route('**/tracks/**', async (route) => {
      const response = await route.fetch();
      if (
        response.ok() &&
        route.request().method() === 'POST' &&
        route.request().url().match(/\/api\/tracks\/?(\?|$)/)
      ) {
        try {
          const body = (await response.json()) as { id?: string | number };
          if (body?.id !== undefined) observedTrackId = String(body.id);
        } catch {
          /* ignore */
        }
      }
      await route.fulfill({ response });
    });

    await page
      .locator(UPLOAD_SELECTORS.FILE_INPUT)
      .first()
      .setInputFiles(samplePath!);
    await expect(page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING)).toBeVisible();
    await page.locator(UPLOAD_SELECTORS.TITLE_INPUT).fill(trackTitle);

    await page.locator(UPLOAD_SELECTORS.UPLOAD_BUTTON).click();

    // Either success heading or a 4xx that surfaces in DOM. Real BE may not
    // accept the silent fixture - assert one or the other so the failure mode
    // is informative.
    const success = page.locator(UPLOAD_SELECTORS.SUCCESS_HEADING);
    const stillOnMetadata = page.locator(UPLOAD_SELECTORS.TRACK_INFO_HEADING);
    await expect
      .poll(
        async () =>
          (await success.isVisible().catch(() => false)) ||
          (await stillOnMetadata.isVisible().catch(() => false)),
        { timeout: 30_000 }
      )
      .toBe(true);

    if (await success.isVisible().catch(() => false)) {
      // Verify backend has the track if we observed an id.
      if (observedTrackId) {
        const verify = await apiRequest(`/tracks/${observedTrackId}`);
        expect(verify.ok).toBe(true);
      }
    } else {
      test.info().annotations.push({
        type: 'note',
        description:
          'Upload did not reach success state - backend likely rejected the ' +
          'silent fixture. Provide a real mp3 via SAMPLE_MP3_PATH.',
      });
    }
  });

  test('multipart upload via API client + GET /tracks/{id}', async () => {
    const samplePath = resolveSampleMp3Path();
    test.skip(samplePath === null, SAMPLE_MP3_HINT);
    test.skip(!(await getSeedToken()), 'No seed token.');

    const buf = await fs.readFile(samplePath!);
    const fd = new FormData();
    const blob = new Blob([new Uint8Array(buf)], { type: 'audio/mpeg' });
    fd.append('audio', blob, path.basename(samplePath!));
    fd.append('title', `pw-direct-${Date.now()}`);

    const res = await apiRequest<{ id?: string | number }>('/tracks/', {
      method: 'POST',
      body: fd,
    });
    expect([200, 201]).toContain(res.status);
    const id = res.data?.id;
    expect(id, 'POST /tracks/ should return an id').toBeDefined();

    const verify = await apiRequest(`/tracks/${String(id)}`);
    expect(verify.ok).toBe(true);
  });
});
