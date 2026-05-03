import { useCallback, useEffect } from "react";
import { useEngagementStore } from "@/store/engagementStore";
import { engagementService } from "@/services/di";
import type { ITrack } from "@/types/track.types";

/**
 * Seed the store with server data from a track object (call once when track loads).
 * Safe to call in useEffect([track.id]) — won't overwrite in-session interactions.
 */
export function useInitTrackEngagement(track: ITrack) {
  const init = useEngagementStore((s) => s.init);
  useEffect(() => {
    init(track.id, {
      isLiked:    track.isLiked    ?? false,
      likes:      track.likes,
      isReposted: track.isReposted ?? false,
      reposts:    track.reposts    ?? 0,
    });
  }, [track.id]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Read engagement state and get toggle actions for a single track.
 * All components sharing the same trackId are automatically in sync.
 */
export function useTrackEngagement(trackId: string) {
  const state  = useEngagementStore((s) => s.tracks[trackId]);
  const patch  = useEngagementStore((s) => s.patch);

  const isLiked    = state?.isLiked    ?? false;
  const likes      = state?.likes      ?? 0;
  const isReposted = state?.isReposted ?? false;
  const reposts    = state?.reposts    ?? 0;

  const toggleLike = useCallback(async () => {
    // Read from store at call-time to avoid stale closure
    const cur = useEngagementStore.getState().tracks[trackId];
    const wasLiked = cur?.isLiked ?? false;
    const prevLikes = cur?.likes  ?? 0;

    const newLiked  = !wasLiked;
    const optimistic = newLiked ? prevLikes + 1 : prevLikes - 1;

    patch(trackId, { isLiked: newLiked, likes: optimistic });

    try {
      const result = newLiked
        ? await engagementService.likeTrack(trackId)
        : await engagementService.unlikeTrack(trackId);
      if (result.likeCount >= 0) patch(trackId, { likes: result.likeCount });
    } catch {
      patch(trackId, { isLiked: wasLiked, likes: prevLikes }); // rollback
    }
  }, [trackId, patch]);

  const toggleRepost = useCallback(async () => {
    const cur = useEngagementStore.getState().tracks[trackId];
    const wasReposted = cur?.isReposted ?? false;
    const prevReposts = cur?.reposts    ?? 0;

    const newReposted = !wasReposted;
    const optimistic  = newReposted ? prevReposts + 1 : Math.max(0, prevReposts - 1);

    patch(trackId, { isReposted: newReposted, reposts: optimistic });

    try {
      if (newReposted) {
        await engagementService.repostTrack(trackId);
      } else {
        await engagementService.removeRepost(trackId);
      }
    } catch {
      patch(trackId, { isReposted: wasReposted, reposts: prevReposts }); // rollback
    }
  }, [trackId, patch]);

  return { isLiked, likes, isReposted, reposts, toggleLike, toggleRepost };
}
