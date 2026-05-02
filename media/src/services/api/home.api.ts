/**
 * Home Real API Service
 * Place at: services/api/home.api.ts
 */
 
import { ENV } from "@/config/env";
import type { IHomeService, IHomePageData, IArtist } from "@/types/home.types";
import type { ITrack } from "@/types/track.types";
import type { IStation } from "@/types/station.types";
import { apiGet } from "./apiClient";
 
const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");
 
// ── RAW SHAPES ────────────────────────────────────────────────────────────────
 
interface IRawFeedTrack {
  track_id:         string;
  title:            string;
  description:      string | null;
  genre:            string | null;
  cover_image_url:  string | null;
  stream_url:       string | null;
  duration_seconds: number | null;
  play_count:       number;
  like_count:       number;
  comment_count:    number;
  repost_count:     number;
  is_liked:         boolean;
  is_reposted:      boolean;
  created_at:       string;
  artist: {
    user_id:         string;
    username:        string;
    display_name:    string;
    profile_picture: string | null;
  };
}
 
interface IRawRecentlyPlayedItem {
  history_id:                string;
  played_at:                 string;
  duration_listened_seconds: number;
  track: {
    track_id:         string;
    title:            string;
    description:      string | null;
    cover_image_url:  string | null;
    stream_url:       string | null;
    duration_seconds: number | null;
    play_count:       number;
    like_count?:      number;
    repost_count?:    number;
    comment_count?:   number;
    is_liked?:        boolean;
    is_reposted?:     boolean;
    // Artist info — may or may not be present depending on backend version
    artist?: {
      user_id?:        string;
      username?:       string;
      display_name?:   string;
      profile_picture?: string | null;
    };
    display_name?: string;   // some backends flatten this
    username?:     string;
  };
}
 
interface IRawSearchUser {
  user_id:         string;
  username:        string;
  display_name:    string;
  profile_picture: string | null;
  follower_count:  number;
  is_verified:     boolean;
  is_following:    boolean;
}
 
// ── HELPERS ───────────────────────────────────────────────────────────────────
 
function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}
 
function resolveImage(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}
 
// ── ADAPTERS ──────────────────────────────────────────────────────────────────
 
function adaptFeedTrack(raw: IRawFeedTrack): ITrack {
  return {
    id:            raw.track_id,
    title:         raw.title,
    // Carry both display_name AND username so navigation works
    artist:        raw.artist?.display_name ?? "Unknown Artist",
    // We store username in a non-standard field for navigation; components can cast to access it
    albumArt:      resolveImage(raw.cover_image_url, "/default-track-cover.png"),
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           resolveUrl(raw.stream_url),
    duration:      raw.duration_seconds ?? 0,
    likes:         raw.like_count,
    plays:         raw.play_count,
    commentsCount: raw.comment_count,
    reposts:       raw.repost_count ?? 0,
    isLiked:       raw.is_liked,
    isReposted:    raw.is_reposted ?? false,
    createdAt:     raw.created_at,
    updatedAt:     raw.created_at,
    // Store username for router.push(`/${username}`) in components
    artistUsername: raw.artist?.username ?? "",
  } as ITrack & { artistUsername: string };
}
 
function adaptRecentlyPlayed(raw: IRawRecentlyPlayedItem): ITrack & { type: "track"; playedAt: string; artistUsername: string } {
  const t = raw.track;
 
  // Try to resolve artist name from nested .artist object first,
  // then flat display_name/username fields (some backend versions flatten these)
  const artistName =
    t.artist?.display_name ??
    t.display_name ??
    t.artist?.username ??
    t.username ??
    "";
 
  const artistUsername =
    t.artist?.username ??
    t.username ??
    "";
 
  return {
    id:            t.track_id,
    title:         t.title,
    artist:        artistName,
    artistUsername,
    albumArt:      resolveImage(t.cover_image_url, "/default-track-cover.png"),
    description:   t.description ?? undefined,
    url:           resolveUrl(t.stream_url),
    duration:      t.duration_seconds ?? 0,
    likes:         t.like_count    ?? 0,
    plays:         t.play_count    ?? 0,
    commentsCount: t.comment_count ?? 0,
    reposts:       t.repost_count  ?? 0,
    isLiked:       t.is_liked      ?? false,
    isReposted:    t.is_reposted   ?? false,
    createdAt:     raw.played_at,
    updatedAt:     raw.played_at,
    // Extra fields used by RecentlyPlayedGrid / ListeningHistory
    type:          "track" as const,
    playedAt:      raw.played_at,
  };
}
 
function adaptUser(raw: IRawSearchUser): IArtist {
  return {
    id:          raw.user_id,
    // Expose username so ArtistsFollow can build the correct route
    username:    raw.username,
    name:        raw.display_name,
    followers:   raw.follower_count.toLocaleString(),
    tracksCount: 0,
    imageUrl:    resolveImage(raw.profile_picture, "/default-avatar.png"),
    type: "artist",
  } as IArtist & { username: string };
}
 
function trackToStation(track: ITrack): IStation {
  return {
    id:         track.id,
    name:       `Based on ${track.title}`,
    artistName: track.artist,
    coverArt:   track.albumArt,
    seedTrack:  track,
    isLiked:    false,
    genre:      track.genre,
  };
}
 
function dedup<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
 
// ── REAL SERVICE ──────────────────────────────────────────────────────────────
 
export const realHomeService: IHomeService = {
  getHomePageData: async (): Promise<IHomePageData> => {
    // Step 1: get who the current user follows
    let myFollowing: Array<{
      user_id: string;
      display_name: string;
      profile_picture: string | null;
    }> = [];
 
    try {
      const followingRes = await apiGet<{
        count: number;
        following: Array<{
          user_id: string;
          display_name: string;
          is_premium: boolean;
          profile_picture: string | null;
          followed_at: string;
        }>;
      }>(`${process.env.NEXT_PUBLIC_API_URL}/users/me/following`);
      myFollowing = followingRes?.following ?? [];
    } catch (e) {
      console.warn("Could not fetch following list:", e);
    }
 
    const myFollowingIds = new Set(myFollowing.map((u) => u.user_id));
 
    // Step 2: feed + recently-played + friend-of-friend suggestions in parallel
    const [feedRes, recentRes, ...friendSuggestionResults] = await Promise.allSettled([
      apiGet<{ items: IRawFeedTrack[] }>(
        `${process.env.NEXT_PUBLIC_API_URL}/feed/following?limit=50`
      ),
      apiGet<{ items: IRawRecentlyPlayedItem[] }>(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/recently-played?limit=20`
      ),
      // Fetch following lists of first 3 people you follow
      ...myFollowing.slice(0, 3).map((u) =>
        apiGet<{
          following: Array<{
            user_id:         string;
            display_name:    string;
            username:        string;
            profile_picture: string | null;
            is_premium:      boolean;
          }>;
        }>(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(u.display_name)}/following`
        )
      ),
    ]);
 
    const allFeedTracks =
      feedRes.status === "fulfilled"
        ? (feedRes.value?.items ?? []).map(adaptFeedTrack)
        : [];
 
    const recentlyPlayed =
      recentRes.status === "fulfilled"
        ? dedup((recentRes.value?.items ?? []).map(adaptRecentlyPlayed))
        : [];
 
    // Build follow suggestions
    const suggestionMap = new Map<string, IArtist>();
    for (const result of friendSuggestionResults) {
      if (result.status === "fulfilled") {
        const list = result.value?.following ?? [];
        for (const u of list) {
          if (!myFollowingIds.has(u.user_id) && !suggestionMap.has(u.user_id)) {
            suggestionMap.set(u.user_id, {
              id:          u.user_id,
              username:    u.username ?? u.display_name,
              name:        u.display_name,
              followers:   "",
              tracksCount: 0,
              imageUrl:    resolveImage(u.profile_picture, "/default-avatar.png"),
              type: "artist",
            } as IArtist & { username: string });
          }
        }
      }
    }
    const followSuggestions = [...suggestionMap.values()].slice(0, 4);
 
    if (feedRes.status   === "rejected") console.warn("feed failed:",   feedRes.reason);
    if (recentRes.status === "rejected") console.warn("recent failed:", recentRes.reason);
 
    const moreOfWhatYouLike = allFeedTracks.slice(0, 10);
    const mixedForUser      = allFeedTracks.slice(10, 20);
    const stationSlice      = allFeedTracks.slice(20, 30);
 
    return {
      moreOfWhatYouLike,
      recentlyPlayed,
      mixedForUser,
      discoverStations:  stationSlice.map(trackToStation),
      followSuggestions,
      listeningHistory:  recentlyPlayed.slice(0, 3),
    };
  },
 
  refreshFollowSuggestions: async (): Promise<IArtist[]> => {
    try {
      const data = await apiGet<{ users: IRawSearchUser[] }>(`/search/users?keyword=`);
      return (data?.users ?? []).slice(0, 4).map(adaptUser);
    } catch {
      return [];
    }
  },
};
 