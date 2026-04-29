/**
 * Search types
 * Place at: types/search.types.ts
 */

import type { ITrack } from "@/types/track.types";

// ── RAW API SHAPES (exactly what the backend returns) ─────────────────────────

export interface IRawSearchTrack {
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
  // cover_image: string | null  ← TODO: not in API yet, flag to backend
}

export type ITab = "all" | "tracks" | "people" | "playlists";

export interface ISearchUser {
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

export interface ISearchPlaylist {
  playlist_id: string;
  title: string;
  description: string | null;
  cover_photo: string | null;
  visibility: "public" | "private";
  track_count: number;
  user_id: string;
  created_at: string;
}

// ── SEARCH RESULTS ────────────────────────────────────────────────────────────

export interface ISearchResults {
  tracks: ITrack[];              // adapted via adaptTrack() so TrackCard works directly
  users: ISearchUser[];
  playlists: ISearchPlaylist[];
}

// ── SERVICE INTERFACE ─────────────────────────────────────────────────────────

export interface ISearchService {
  searchTracks(keyword: string): Promise<ITrack[]>;
  searchUsers(keyword: string): Promise<ISearchUser[]>;
  searchPlaylists(keyword: string): Promise<ISearchPlaylist[]>;
  searchAll(keyword: string): Promise<ISearchResults>;
}

export interface ISuggestion {
  id: string;
  label: string;
  sublabel: string;
  type: "track" | "user";
}

export interface ISearchBarProps {
  /** Pre-fill the input — use on /search page to reflect ?q= param */
  defaultValue?: string;
  placeholder?: string;
  /** Override submit behaviour — if omitted, navigates to /search?q=... */
  onSearch?: (query: string) => void;
}