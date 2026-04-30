/**
 * Feed types
 * Place at: types/feed.types.ts
 */

import type { ITrack } from "@/types/track.types";
import type { IArtist } from "@/types/home.types";

// ── RAW API SHAPES ────────────────────────────────────────────────────────────

/** Nested artist object returned inside each feed track */
export interface IRawFeedArtist {
  user_id: string;
  username: string;
  display_name: string;
  is_premium: boolean;
  billing_cycle: string;
  profile_picture: string | null;
  follower_count: number;
}

/** Shape returned by GET /feed/following and GET /feed/discover */
export interface IRawFeedTrack {
  track_id:         string;
  title:            string;
  description:      string | null;
  genre:            string | null;
  tags:             string[];
  release_date:     string | null;
  cover_image_url:  string | null;
  stream_url:       string | null;
  duration_seconds: number | null;
  play_count:       number;
  like_count:       number;
  repost_count:     number;
  comment_count:    number;
  is_liked:         boolean;
  is_reposted:      boolean;
  created_at:       string;
  artist: {
    user_id:         string;
    username:        string;
    display_name:    string;
    is_premium:      boolean;
    billing_cycle:   string | null;
    profile_picture: string | null;
    follower_count:  number;
  };
}

export interface IRawFeedUser {
  user_id: string;
  display_name: string;
  bio: string | null;
  location: string | null;
  account_type: string;
  is_private: boolean;
  profile_picture: string | null;
  cover_photo: string | null;
  follower_count: number;
  following_count: number;
  track_count: number;
  created_at: string;
}

export interface IRawHistoryEntry {
  track_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  tags: string[];
  release_date: string | null;
  file_url: string | null;
  user_id: string;
  visibility: "public" | "private";
  processing_status: "finished" | "processing" | "failed";
  play_count: number;
  duration_seconds: number | null;
  played_at?: string;
}

// ── FEED PAGE DATA ────────────────────────────────────────────────────────────

export interface IFeedPageData {
  feedTracks: ITrack[];
  followSuggestions: IArtist[];
  listeningHistory: ITrack[];
}

// ── SERVICE INTERFACE ─────────────────────────────────────────────────────────

export interface IFeedService {
  getFeedPageData(): Promise<IFeedPageData>;
  refreshFollowSuggestions(): Promise<IArtist[]>;
}