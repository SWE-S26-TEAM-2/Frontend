// src/types/library.types.ts

export interface ILibraryTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  accentColor?: string;
  plays?: number;
  likes?: number;
  reposts?: number;
  duration?: string;
  likedAt?: string; // ISO date string
  genre?: string;
  waveformData?: number[]; // normalized 0–1 amplitude values for the Waveform component
}

export interface ILibraryPlaylist {
  id: string;
  title: string;
  trackCount: number;
  coverUrl: string | null;
  accentColor?: string;
  isPrivate?: boolean;
}

export interface ILibraryAlbum {
  id: string;
  title: string;
  artist: string;
  trackCount: number;
  coverUrl: string | null;
  accentColor?: string;
  year?: number;
}

export interface ILibraryStation {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string | null;
  accentColor?: string;
}

export interface ILibraryFollowing {
  id: string;
  username: string;
  avatarUrl: string | null;
  followers: number;
  isVerified?: boolean;
}

export interface ILibraryRecentItem {
  id: string;
  type: "user" | "track" | "playlist";
  label: string;
  coverUrl: string | null;
  accentColor?: string;
  href: string;
}

export interface ILibraryOverview {
  recentlyPlayed: ILibraryRecentItem[];
  likes: ILibraryTrack[];
  playlists: ILibraryPlaylist[];
  albums: ILibraryAlbum[];
  stations: ILibraryStation[];
  following: ILibraryFollowing[];
}

export interface ILibraryService {
  getOverview(): Promise<ILibraryOverview>;
  getLikes(): Promise<ILibraryTrack[]>;
  getPlaylists(): Promise<ILibraryPlaylist[]>;
  getAlbums(): Promise<ILibraryAlbum[]>;
  getStations(): Promise<ILibraryStation[]>;
  getFollowing(): Promise<ILibraryFollowing[]>;
  clearHistory(): Promise<void>; // FIX: was missing from interface — needed by HistoryTab
}

// FIX: these are union type aliases, NOT interfaces — drop the "I" prefix per naming conventions
export type LibraryTab = "Overview" | "Likes" | "Playlists" | "Albums" | "Stations" | "Following" | "History";
export type ViewMode = "grid" | "list";