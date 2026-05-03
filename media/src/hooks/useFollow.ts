import { useCallback } from "react";
import { useFollowStore } from "@/store/followStore";
import { userProfileService } from "@/services/di";

/**
 * Read follow state and get a toggle action for a given username.
 * Call useFollowStore.getState().init(username, isFollowing) to seed from server data.
 */
export function useFollow(username: string) {
  const isFollowing  = useFollowStore((s) => s.following[username] ?? false);
  const isLoading    = useFollowStore((s) => s.loading[username]   ?? false);
  const setFollowing = useFollowStore((s) => s.setFollowing);
  const setLoading   = useFollowStore((s) => s.setLoading);

  const toggleFollow = useCallback(async () => {
    if (!username || isLoading) return;

    const cur = useFollowStore.getState().following[username] ?? false;
    const next = !cur;

    setFollowing(username, next);
    setLoading(username, true);

    try {
      if (next) {
        await userProfileService.followUser(username);
      } else {
        await userProfileService.unfollowUser(username);
      }
    } catch {
      setFollowing(username, cur); // rollback
    } finally {
      setLoading(username, false);
    }
  }, [username, isLoading, setFollowing, setLoading]);

  return { isFollowing, isLoading, toggleFollow };
}
