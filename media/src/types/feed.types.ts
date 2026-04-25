/**
 * Feed types
 * Place at: types/feed.types.ts
 */

import type { ITrack } from "@/types/track.types";
import type { IArtist } from "@/types/home.types";

// ── RAW API SHAPES ────────────────────────────────────────────────────────────

export interface IRawFeedTrack {
  track_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  tags: string[];
  release_date: string | null;
  file_url: string;
  user_id: string;
  visibility: "public" | "private";
  processing_status: "finished" | "processing" | "failed";
  play_count: number;
  duration_seconds: number | null;
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
  file_url: string;
  user_id: string;
  visibility: "public" | "private";
  processing_status: "finished" | "processing" | "failed";
  play_count: number;
  duration_seconds: number | null;
  played_at?: string;
}

// ── FEED PAGE DATA ────────────────────────────────────────────────────────────

export interface IFeedPageData {
  feedTracks: ITrack[];         // tracks from followed users
  followSuggestions: IArtist[]; // users to follow
  listeningHistory: ITrack[];   // last 3 from history
}

// ── SERVICE INTERFACE ─────────────────────────────────────────────────────────

export interface IFeedService {
  getFeedPageData(): Promise<IFeedPageData>;
  refreshFollowSuggestions(): Promise<IArtist[]>;
}