/**
 * playlist.service.extensions.ts
 *
 * DROP-IN additions layered on top of realPlaylistService.
 * Compatible with the actual IPlaylistService interface — no backend changes.
 *
 * Public surface:
 *   batchUpdateTracks(playlistId, added, removed)  → sequential with retry + partial failure
 *   batchAddTracks(playlistId, trackIds)            → convenience wrapper
 *   batchRemoveTracks(playlistId, trackIds)         → convenience wrapper
 *   uploadCoverWithRetry(playlistId, file)          → 3-attempt linear backoff
 *   getLikedPlaylistIds()                           → Set<string>, cached 30s
 *   invalidateLikedCache()                         → clear after like/unlike
 */

import { playlistCache, CacheKeys } from "@/utils/playlistCache";
import { withRetry } from "@/utils/mutationQueue";
import { handleIPlaylistError, PlaylistErrorContext } from "@/utils/playlistErrors";
import type { IPlaylistTrack, IPlaylistService } from "@/types/playlist.types";

export interface IBatchResult {
  succeeded: { track_id: string }[];
  failed: Array<{ operation: { track_id: string }; error: string }>;
}

// Use IPlaylistService directly

export function createPlaylistServiceExtensions(core: IPlaylistService) {
  async function batchUpdateTracks(
    playlistId: string,
    added: Array<{ track_id: string; [k: string]: unknown }>,
    removed: Array<{ track_id: string }>,
  ): Promise<IBatchResult> {
    const succeeded: { track_id: string }[] = [];
    const failed: IBatchResult["failed"] = [];

    const operations: Array<{
      op: { track_id: string };
      context: PlaylistErrorContext;
      fn: () => Promise<void>;
    }> = [
      ...added.map((op) => ({
        op,
        context: "addTrack" as PlaylistErrorContext,
        fn: async () => {
          // Build minimal IPlaylistTrack from TrackedTrack fields
          const track: IPlaylistTrack = {
            id: op.track_id,
            title: (op.title as string) ?? "",
            artist: (op.artist as string) ?? (op.user_id as string) ?? "",
            albumArt: (op.albumArt as string) ?? (op.cover_image_url as string) ?? "",
            url: (op.url as string) ?? (op.stream_url as string) ?? "",
            duration: (op.duration as number) ?? (op.duration_seconds as number) ?? 0,
          };
          await core.addTrackToPlaylist(playlistId, track);
        },
      })),
      ...removed.map((op) => ({
        op,
        context: "removeTrack" as PlaylistErrorContext,
        fn: async () => {
          await core.removeTrackFromPlaylist(playlistId, op.track_id);
        },
      })),
    ];

    for (const { op, context, fn } of operations) {
      try {
        await withRetry(fn, 2, 600);
        succeeded.push(op);
      } catch (err) {
        const structured = handleIPlaylistError(err, context);
        failed.push({ operation: op, error: structured.message });
      }
    }

    return { succeeded, failed };
  }

  async function batchAddTracks(
    playlistId: string,
    tracks: Array<{ track_id: string; [k: string]: unknown }>,
  ): Promise<IBatchResult> {
    return batchUpdateTracks(playlistId, tracks, []);
  }

  async function batchRemoveTracks(
    playlistId: string,
    trackIds: string[],
  ): Promise<IBatchResult> {
    return batchUpdateTracks(
      playlistId,
      [],
      trackIds.map((id) => ({ track_id: id })),
    );
  }

  async function uploadCoverWithRetry(
    playlistId: string,
    file: File,
  ): Promise<string> {
    return withRetry(() => core.uploadCover(playlistId, file), 3, 1000);
  }

  async function getLikedPlaylistIds(): Promise<Set<string>> {
    const cacheKey = CacheKeys.likedIds();
    const cached = playlistCache.get<string[]>(cacheKey);

    if (cached && !cached.stale) {
      return new Set(cached.data);
    }

    try {
      const liked = await core.getLikedPlaylists();
      // Support both normalised (id) and raw (playlist_id) shapes
      const ids = liked.map((p) => p.id).filter(Boolean);
      playlistCache.set(cacheKey, ids, 30_000);
      return new Set(ids);
    } catch (err) {
      const structured = handleIPlaylistError(err, "fetchLiked");
      if (cached) return new Set(cached.data);
      throw structured;
    }
  }

  function invalidateLikedCache(): void {
    playlistCache.invalidate(CacheKeys.likedIds());
  }

  return {
    batchUpdateTracks,
    batchAddTracks,
    batchRemoveTracks,
    uploadCoverWithRetry,
    getLikedPlaylistIds,
    invalidateLikedCache,
  };
}
