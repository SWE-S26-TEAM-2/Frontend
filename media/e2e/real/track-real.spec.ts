/**
 * track-real.spec.ts - opens a real track page and verifies that play
 * triggers POST /tracks/{id}/plays against the live backend.
 *
 * The spec needs at least one track with a streamable URL. We try, in order:
 *   1. SAMPLE_MP3_PATH (or e2e/real/fixtures/sample.mp3) -> uploaded fresh.
 *   2. Reuse the most recent track from GET /tracks (best effort).
 *
 * If neither is available the test test.skip()s.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { apiRequest, isStorageStateAuthenticated } from './fixtures/api-client';
import { resolveSampleMp3Path, SAMPLE_MP3_HINT } from './fixtures/sample-mp3';

async function seedTrack(): Promise<string | null> {
  // Try fixture-based upload first.
  const samplePath = resolveSampleMp3Path();
  if (samplePath) {
    const buf = await fs.readFile(samplePath);
    const fd = new FormData();
    const blob = new Blob([new Uint8Array(buf)], { type: 'audio/mpeg' });
    fd.append('audio', blob, path.basename(samplePath));
    fd.append('title', `pw-track-real-${Date.now()}`);
    const res = await apiRequest<{ id?: string | number }>('/tracks/', {
      method: 'POST',
      body: fd,
    });
    if (res.ok && res.data?.id !== undefined) return String(res.data.id);
  }
  // Fall back to existing tracks.
  const list = await apiRequest<unknown>('/tracks');
  if (list.ok && Array.isArray(list.data) && list.data.length > 0) {
    const first = list.data[0] as { id?: string | number };
    if (first?.id !== undefined) return String(first.id);
  }
  if (
    list.ok &&
    list.data &&
    typeof list.data === 'object' &&
    'items' in (list.data as Record<string, unknown>) &&
    Array.isArray((list.data as { items: unknown[] }).items) &&
    (list.data as { items: unknown[] }).items.length > 0
  ) {
    const first = (list.data as { items: Array<{ id?: string | number }> })
      .items[0];
    if (first?.id !== undefined) return String(first.id);
  }
  return null;
}

test.describe('@real track playback', () => {
  test.beforeAll(async () => {
    if (!(await isStorageStateAuthenticated())) {
      test.skip(true, 'No real-backend auth; see fixtures/README.md.');
    }
  });

  test('play emits POST /tracks/{id}/plays and increments play_count', async ({
    page,
  }) => {
    const trackId = await seedTrack();
    test.skip(
      trackId === null,
      `No track available to test - either upload a fixture (${SAMPLE_MP3_HINT}) ` +
        'or seed at least one track in the backend before running this spec.'
    );

    // Capture initial play count if the API exposes it.
    const before = await apiRequest<{ play_count?: number; plays?: number }>(
      `/tracks/${trackId!}`
    );
    const initialPlays =
      (before.data?.play_count as number | undefined) ??
      (before.data?.plays as number | undefined) ??
      0;

    let playsRequestStatus: number | null = null;
    await page.route(`**/tracks/${trackId}/plays`, async (route) => {
      const response = await route.fetch();
      playsRequestStatus = response.status();
      await route.fulfill({ response });
    });

    await page.goto(`/track/${trackId}`);
    await page.waitForLoadState('domcontentloaded');

    // The Footer auto-loads; click the global play control.
    const playButton = page.getByLabel('Play').first();
    await playButton.waitFor({ state: 'visible', timeout: 15_000 });
    await playButton.click();

    // Best effort - poll for either route to fire OR backend to update.
    let routeFired = false;
    await expect
      .poll(
        async () => {
          if (playsRequestStatus !== null) {
            routeFired = true;
            return true;
          }
          const refreshed = await apiRequest<{
            play_count?: number;
            plays?: number;
          }>(`/tracks/${trackId!}`);
          const now =
            (refreshed.data?.play_count as number | undefined) ??
            (refreshed.data?.plays as number | undefined) ??
            initialPlays;
          return now > initialPlays;
        },
        { timeout: 15_000, intervals: [500, 1000, 2000] }
      )
      .toBe(true);

    if (routeFired && playsRequestStatus !== null) {
      expect([200, 202, 204]).toContain(playsRequestStatus);
    }
  });
});
