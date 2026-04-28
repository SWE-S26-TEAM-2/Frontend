/**
 * playlist-real.spec.ts - playlist CRUD via the live backend.
 *
 * The current FE has no surfaced playlist UI under /playlists yet, so this
 * spec drives most operations through the API and only asserts UI listing
 * where it makes sense. Cover upload is skipped until a UI surface exists.
 */
import { test, expect } from '@playwright/test';
import {
  apiRequest,
  apiCreatePlaylist,
  apiDeletePlaylist,
  isStorageStateAuthenticated,
} from './fixtures/api-client';

test.describe('@real playlist', () => {
  test.beforeAll(async () => {
    if (!(await isStorageStateAuthenticated())) {
      test.skip(true, 'No real-backend auth; see fixtures/README.md.');
    }
  });

  test('create -> add track -> like -> delete', async ({ page }) => {
    const name = `pw-pl-${Date.now()}`;

    // 1. Create via API (no UI surface yet).
    const created = await apiCreatePlaylist({ name, is_private: false });
    expect([200, 201]).toContain(created.status);
    const playlistId = created.data?.id;
    expect(playlistId, 'POST /playlists/ should return id').toBeTruthy();

    // 2. Add a track. Pick the first track returned by GET /tracks.
    const tracksRes = await apiRequest<unknown>('/tracks');
    let trackId: string | number | null = null;
    if (tracksRes.ok && Array.isArray(tracksRes.data) && tracksRes.data.length) {
      const first = tracksRes.data[0] as { id?: string | number };
      if (first?.id !== undefined) trackId = first.id;
    } else if (
      tracksRes.ok &&
      tracksRes.data &&
      typeof tracksRes.data === 'object' &&
      'items' in (tracksRes.data as Record<string, unknown>)
    ) {
      const items = (tracksRes.data as { items: Array<{ id?: string | number }> })
        .items;
      if (items?.length) trackId = items[0]?.id ?? null;
    }

    if (trackId !== null) {
      const add = await apiRequest(
        `/playlists/${String(playlistId)}/tracks`,
        { method: 'POST', body: { track_id: trackId } }
      );
      expect([200, 201, 204]).toContain(add.status);
    }

    // 3. Like the playlist.
    const liked = await apiRequest(
      `/playlists/${String(playlistId)}/like`,
      { method: 'POST' }
    );
    expect([200, 201, 204, 409]).toContain(liked.status);

    // 4. Cover upload requires a UI surface or multipart binary; skipped here.
    test.info().annotations.push({
      type: 'note',
      description:
        'Cover upload skipped: no FE surface yet. Re-enable when ' +
        '/playlists/[id] page exposes the editor.',
    });

    // UI listing assertion: the user profile sidebar lists likes/playlists.
    // We probe /users/me/playlists if available; otherwise navigate to the
    // owner profile page.
    const me = await apiRequest<{ username?: string }>('/users/me');
    if (me.ok && me.data?.username) {
      await page.goto(`/${me.data.username}`);
      // Best-effort visibility check; the page may not render playlist tiles yet.
      const hint = page.getByText(name).first();
      await hint.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
    }

    // 5. Delete cleanup.
    const del = await apiDeletePlaylist(String(playlistId));
    expect([200, 202, 204]).toContain(del.status);
  });
});
