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
  is_liked:         boolean;
  created_at:       string;
  artist: {
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

// ── ADAPTERS ──────────────────────────────────────────────────────────────────

function adaptFeedTrack(raw: IRawFeedTrack): ITrack {
  return {
    id:            raw.track_id,
    title:         raw.title,
    artist:        raw.artist?.display_name ?? "Unknown Artist",
    albumArt:      raw.cover_image_url
                     ? raw.cover_image_url.startsWith("http")
                       ? raw.cover_image_url
                       : `${BASE_URL}${raw.cover_image_url}`
                     : "/default-track-cover.png",
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           raw.stream_url
                     ? raw.stream_url.startsWith("http")
                       ? raw.stream_url
                       : `${BASE_URL}${raw.stream_url}`
                     : "",
    duration:      raw.duration_seconds ?? 0,
    likes:         raw.like_count,
    plays:         raw.play_count,
    commentsCount: raw.comment_count,
    isLiked:       raw.is_liked,
    createdAt:     raw.created_at,
    updatedAt:     raw.created_at,
  };
}

function adaptRecentlyPlayed(raw: IRawRecentlyPlayedItem) {
  const t = raw.track;
  return {
    // ITrack fields
    id:            t.track_id,
    title:         t.title,
    artist:        "Unknown Artist", // recently-played endpoint has no artist field
    albumArt:      t.cover_image_url
                     ? t.cover_image_url.startsWith("http")
                       ? t.cover_image_url
                       : `${BASE_URL}${t.cover_image_url}`
                     : "/default-track-cover.png",
    description:   t.description ?? undefined,
    url:           t.stream_url
                     ? t.stream_url.startsWith("http")
                       ? t.stream_url
                       : `${BASE_URL}${t.stream_url}`
                     : "",
    duration:      t.duration_seconds ?? 0,
    likes:         0,
    plays:         t.play_count,
    commentsCount: 0,
    isLiked:       false,
    createdAt:     raw.played_at,
    updatedAt:     raw.played_at,
    // extra fields for RecentlyPlayedGrid
    type:          "track" as const,
    playedAt:      raw.played_at,
  };
}

function adaptUser(raw: IRawSearchUser): IArtist {
  return {
    id:          raw.user_id,
    name:        raw.display_name,
    followers:   raw.follower_count.toLocaleString(),
    tracksCount: 0, // not in search/users response
    imageUrl:    raw.profile_picture
                   ? raw.profile_picture.startsWith("http")
                     ? raw.profile_picture
                     : `${BASE_URL}${raw.profile_picture}`
                   : "/default-avatar.png",
    type: "artist",
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
  // Step 1: get who the current user follows
  let myFollowing: Array<{ user_id: string; display_name: string; profile_picture: string | null }> = [];
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
    console.log("My following:", myFollowing);
  } catch (e) {
    console.warn("Could not fetch following list:", e);
  }

  const myFollowingIds = new Set(myFollowing.map((u) => u.user_id));

  // Step 2: fetch feed + recently-played + friends-of-friends suggestions in parallel
  const [feedRes, recentRes, ...friendSuggestionResults] = await Promise.allSettled([
    apiGet<{ items: IRawFeedTrack[] }>(`${process.env.NEXT_PUBLIC_API_URL}/feed/following?limit=50`),
    apiGet<{ items: IRawRecentlyPlayedItem[] }>(`${process.env.NEXT_PUBLIC_API_URL}/users/me/recently-played?limit=20`),
    // Fetch following lists of first 3 people you follow to find suggestions
    ...myFollowing.slice(0, 3).map((u) =>
      apiGet<{
        following: Array<{
          user_id: string;
          display_name: string;
          profile_picture: string | null;
          is_premium: boolean;
        }>;
      }>(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.display_name.replace(/\s/g, "")}/following`)
    ),
  ]);

  const allFeedTracks =
    feedRes.status === "fulfilled"
      ? (feedRes.value?.items ?? []).map(adaptFeedTrack)
      : [];

  console.log("All feed tracks:", allFeedTracks);

  const recentlyPlayed =
    recentRes.status === "fulfilled"
      ? (recentRes.value?.items ?? []).map(adaptRecentlyPlayed)
      : [];

  // Build follow suggestions: people your followers follow, that you don't already follow
  const suggestionMap = new Map<string, IArtist>();
  for (const result of friendSuggestionResults) {
    if (result.status === "fulfilled") {
      const list = result.value?.following ?? [];
      for (const u of list) {
        if (!myFollowingIds.has(u.user_id) && !suggestionMap.has(u.user_id)) {
          suggestionMap.set(u.user_id, {
            id: u.user_id,
            name: u.display_name,
            followers: "",
            tracksCount: 0,
            imageUrl: u.profile_picture
              ? u.profile_picture.startsWith("http")
                ? u.profile_picture
                : `${BASE_URL}${u.profile_picture}`
              : "/default-avatar.png",
            type: "artist",
          });
        }
      }
    }
  }
  const followSuggestions = [...suggestionMap.values()].slice(0, 4);

  if (feedRes.status === "rejected")   console.warn("feed failed:", feedRes.reason);
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