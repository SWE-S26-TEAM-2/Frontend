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
    artist?: {
      user_id?:         string;
      username?:        string;
      display_name?:    string;
      profile_picture?: string | null;
    };
    display_name?: string;
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

interface IRawTrack {
  track_id:          string;
  title:             string;
  description?:      string | null;
  genre?:            string | null;
  cover_image_url?:  string | null;
  stream_url?:       string | null;
  duration_seconds?: number | null;
  play_count?:       number;
  like_count?:       number;
  comment_count?:    number;
  repost_count?:     number;
  is_liked?:         boolean;
  is_reposted?:      boolean;
  created_at?:       string;
  display_name?:     string;
  username?:         string;
  artist?: {
    user_id?:         string;
    username?:        string;
    display_name?:    string;
    profile_picture?: string | null;
  };
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

function dedup<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Fill a section to `count` items from pool.
 * If the pool is smaller than needed, the first `pool.length` slots are taken
 * as-is; the remainder are filled with tracks that have a unique synthetic id
 * (originalId_dup_N) so React key collisions never occur.
 */
function fillSection(pool: ITrack[], count: number): ITrack[] {
  if (pool.length === 0) return [];
  if (pool.length >= count) return pool.slice(0, count);

  const result: ITrack[] = [...pool];
  let dupCounter = 0;

  while (result.length < count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (const track of shuffled) {
      if (result.length >= count) break;
      // Give each cycled copy a unique id so it never clashes with the original
      result.push({ ...track, id: `${track.id}_dup_${dupCounter++}` });
    }
  }

  return result;
}

// ── ADAPTERS ──────────────────────────────────────────────────────────────────

function adaptFeedTrack(raw: IRawFeedTrack): ITrack & { artistUsername: string } {
  return {
    id:             raw.track_id,
    title:          raw.title,
    artist:         raw.artist?.display_name ?? "Unknown Artist",
    artistUsername: raw.artist?.username ?? "",
    albumArt:       resolveImage(raw.cover_image_url, "/default-track-cover.png"),
    genre:          raw.genre ?? undefined,
    description:    raw.description ?? undefined,
    url:            resolveUrl(raw.stream_url),
    duration:       raw.duration_seconds ?? 0,
    likes:          raw.like_count,
    plays:          raw.play_count,
    commentsCount:  raw.comment_count,
    reposts:        raw.repost_count ?? 0,
    isLiked:        raw.is_liked,
    isReposted:     raw.is_reposted ?? false,
    createdAt:      raw.created_at,
    updatedAt:      raw.created_at,
  };
}

function adaptRawTrack(raw: IRawTrack): ITrack & { artistUsername: string } {
  const artistName =
    raw.artist?.display_name ?? raw.display_name ??
    raw.artist?.username     ?? raw.username ?? "Unknown Artist";
  const artistUsername = raw.artist?.username ?? raw.username ?? "";

  return {
    id:             raw.track_id,
    title:          raw.title,
    artist:         artistName,
    artistUsername,
    albumArt:       resolveImage(raw.cover_image_url, "/default-track-cover.png"),
    genre:          raw.genre ?? undefined,
    description:    raw.description ?? undefined,
    url:            resolveUrl(raw.stream_url),
    duration:       raw.duration_seconds ?? 0,
    likes:          raw.like_count    ?? 0,
    plays:          raw.play_count    ?? 0,
    commentsCount:  raw.comment_count ?? 0,
    reposts:        raw.repost_count  ?? 0,
    isLiked:        raw.is_liked      ?? false,
    isReposted:     raw.is_reposted   ?? false,
    createdAt:      raw.created_at    ?? "",
    updatedAt:      raw.created_at    ?? "",
  };
}

function adaptRecentlyPlayed(
  raw: IRawRecentlyPlayedItem,
): ITrack & { artistUsername: string; type: "track"; playedAt: string } {
  const t = raw.track;
  const artistName =
    t.artist?.display_name ?? t.display_name ??
    t.artist?.username     ?? t.username ?? "";
  const artistUsername = t.artist?.username ?? t.username ?? "";

  return {
    id:             t.track_id,
    title:          t.title,
    artist:         artistName,
    artistUsername,
    albumArt:       resolveImage(t.cover_image_url, "/default-track-cover.png"),
    description:    t.description ?? undefined,
    url:            resolveUrl(t.stream_url),
    duration:       t.duration_seconds ?? 0,
    likes:          t.like_count    ?? 0,
    plays:          t.play_count    ?? 0,
    commentsCount:  t.comment_count ?? 0,
    reposts:        t.repost_count  ?? 0,
    isLiked:        t.is_liked      ?? false,
    isReposted:     t.is_reposted   ?? false,
    createdAt:      raw.played_at,
    updatedAt:      raw.played_at,
    type:           "track" as const,
    playedAt:       raw.played_at,
  };
}

function adaptUser(raw: IRawSearchUser): IArtist & { username: string } {
  return {
    id:          raw.user_id,
    username:    raw.username,
    name:        raw.display_name,
    followers:   raw.follower_count.toLocaleString(),
    tracksCount: 0,
    imageUrl:    resolveImage(raw.profile_picture, "/default-avatar.png"),
    type:        "artist",
  };
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

// ── REAL SERVICE ──────────────────────────────────────────────────────────────

export const realHomeService: IHomeService = {
  getHomePageData: async (): Promise<IHomePageData> => {

    // Step 1: who the current user follows
    let myFollowing: Array<{
      user_id:         string;
      display_name:    string;
      username?:       string;
      profile_picture: string | null;
    }> = [];

    try {
      const followingRes = await apiGet<{
        count: number;
        following: Array<{
          user_id:         string;
          display_name:    string;
          username?:       string;
          is_premium:      boolean;
          profile_picture: string | null;
          followed_at:     string;
        }>;
      }>(`${BASE_URL}/users/me/following`);
      myFollowing = followingRes?.following ?? [];
    } catch (e) {
      console.warn("Could not fetch following list:", e);
    }

    const myFollowingIds = new Set(myFollowing.map((u) => u.user_id));

    // Step 2: feed + recently-played + trending fallback + friend suggestions — all parallel
    const [feedRes, recentRes, trendingRes, ...friendSuggestionResults] =
      await Promise.allSettled([
        apiGet<{ items?: IRawFeedTrack[]; tracks?: IRawFeedTrack[] }>(
          `${BASE_URL}/feed/following?limit=50`
        ),
        apiGet<{ items?: IRawRecentlyPlayedItem[]; history?: IRawRecentlyPlayedItem[] }>(
          `${BASE_URL}/users/me/recently-played?limit=20`
        ),
        // Trending as a fallback when the follow-feed is thin or empty
        apiGet<
          | IRawTrack[]
          | { tracks?: IRawTrack[]; items?: IRawTrack[]; data?: { tracks?: IRawTrack[] } }
        >(`${BASE_URL}/tracks?limit=50&sort=popular`),
        // Friends-of-friends for follow suggestions
        ...myFollowing.slice(0, 3).map((u) => {
          const slug = u.username ?? encodeURIComponent(u.display_name);
          return apiGet<{
            following?: Array<{
              user_id:         string;
              display_name:    string;
              username?:       string;
              profile_picture: string | null;
              is_premium:      boolean;
            }>;
          }>(`${BASE_URL}/users/${slug}/following`);
        }),
      ]);

    // ── Adapt feed tracks ─────────────────────────────────────────────────
    const rawFeedItems: IRawFeedTrack[] =
      feedRes.status === "fulfilled"
        ? (feedRes.value?.items ?? feedRes.value?.tracks ?? [])
        : [];
    const feedTracks = rawFeedItems.map(adaptFeedTrack);

    // ── Adapt trending tracks ─────────────────────────────────────────────
    let trendingTracks: (ITrack & { artistUsername: string })[] = [];
    if (trendingRes.status === "fulfilled" && trendingRes.value) {
      const raw = trendingRes.value;
      let rawList: IRawTrack[] = [];
      if (Array.isArray(raw)) {
        rawList = raw as IRawTrack[];
      } else {
        const r = raw as Record<string, unknown>;
        rawList =
          (r.tracks as IRawTrack[]) ??
          (r.items  as IRawTrack[]) ??
          ((r.data as Record<string, unknown>)?.tracks as IRawTrack[]) ??
          [];
      }
      trendingTracks = rawList.map(adaptRawTrack);
    }

    // ── Recently played ───────────────────────────────────────────────────
    const rawRecentItems: IRawRecentlyPlayedItem[] =
      recentRes.status === "fulfilled"
        ? (recentRes.value?.items ?? recentRes.value?.history ?? [])
        : [];
    const recentlyPlayed = dedup(rawRecentItems.map(adaptRecentlyPlayed));

    // ── Build sections — never empty ──────────────────────────────────────
    // Merge feed + trending, deduplicated; feed tracks come first (personalised).
    const allAvailable = dedup([...feedTracks, ...trendingTracks]);

    const moreOfWhatYouLike = fillSection(allAvailable, 10);

    // Shuffle for variety in "Mixed for you"
    const shuffledPool = [...allAvailable].sort(() => Math.random() - 0.5);
    const mixedForUser = fillSection(shuffledPool, 10);

    // Stations: prefer tracks not already in "More of what you like"
    const moreIds     = new Set(moreOfWhatYouLike.map((t) => t.id));
    const stationPool = allAvailable.filter((t) => !moreIds.has(t.id));
    const stationTracks = fillSection(
      stationPool.length >= 5 ? stationPool : allAvailable,
      8,
    );
    const discoverStations = stationTracks.map(trackToStation);

    // ── Follow suggestions ────────────────────────────────────────────────
    const suggestionMap = new Map<string, IArtist & { username: string }>();
    for (const result of friendSuggestionResults) {
      if (result.status === "fulfilled") {
        for (const u of result.value?.following ?? []) {
          if (!myFollowingIds.has(u.user_id) && !suggestionMap.has(u.user_id)) {
            suggestionMap.set(u.user_id, {
              id:          u.user_id,
              username:    u.username ?? u.display_name,
              name:        u.display_name,
              followers:   "",
              tracksCount: 0,
              imageUrl:    resolveImage(u.profile_picture, "/default-avatar.png"),
              type:        "artist",
            });
          }
        }
      }
    }
    const followSuggestions = [...suggestionMap.values()].slice(0, 4);

    if (feedRes.status     === "rejected") console.warn("feed failed:",     feedRes.reason);
    if (recentRes.status   === "rejected") console.warn("recent failed:",   recentRes.reason);
    if (trendingRes.status === "rejected") console.warn("trending failed:", trendingRes.reason);

    return {
      moreOfWhatYouLike,
      recentlyPlayed,
      mixedForUser,
      discoverStations,
      followSuggestions,
      listeningHistory: recentlyPlayed.slice(0, 3),
    };
  },

  refreshFollowSuggestions: async (): Promise<IArtist[]> => {
    try {
      const raw = await apiGet<
        | { users?: IRawSearchUser[] }
        | IRawSearchUser[]
      >(`${BASE_URL}/search/users?keyword=`);
      const users: IRawSearchUser[] = Array.isArray(raw)
        ? raw
        : (raw as { users?: IRawSearchUser[] }).users ?? [];
      return users.slice(0, 4).map(adaptUser);
    } catch {
      return [];
    }
  },
};