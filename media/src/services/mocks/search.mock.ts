/**
 * Search Mock Service
 * Place at: services/mocks/search.mock.ts
 */

import type { ITrack } from "@/types/track.types";
import type {
  ISearchService,
  ISearchResults,
  ISearchUser,
  ISearchPlaylist,
} from "@/types/search.types";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_TRACKS: ITrack[] = [
  {
    id: "mock-track-1",
    title: "Midnight Echoes",
    artist: "Luna Waves",
albumArt: "/default-track-cover.png",
    genre: "Electronic",
    description: "A deep electronic journey through midnight soundscapes.",
    url: "",
    duration: 214,
    likes: 1240,
    plays: 58200,
    commentsCount: 34,
    isLiked: false,
    createdAt: "2024-11-10T00:00:00Z",
    updatedAt: "2024-11-10T00:00:00Z",
  },
  {
    id: "mock-track-2",
    title: "City Rain",
    artist: "The Wanderers",
albumArt: "/default-track-cover.png",
    genre: "Indie",
    description: "Indie vibes inspired by late night city walks.",
    url: "",
    duration: 187,
    likes: 870,
    plays: 32100,
    commentsCount: 12,
    isLiked: true,
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "mock-track-3",
    title: "Golden Hour",
    artist: "SolarDrift",
albumArt: "/default-track-cover.png",
    genre: "Ambient",
    description: "Warm ambient textures for the golden hour.",
    url: "",
    duration: 312,
    likes: 2100,
    plays: 91400,
    commentsCount: 56,
    isLiked: false,
    createdAt: "2024-09-15T00:00:00Z",
    updatedAt: "2024-09-15T00:00:00Z",
  },
  {
    id: "mock-track-4",
    title: "Neon Pulse",
    artist: "Circuit Breaker",
albumArt: "/default-track-cover.png",
    genre: "Electronic",
    description: "High energy synthwave for the late night grind.",
    url: "",
    duration: 253,
    likes: 540,
    plays: 19800,
    commentsCount: 8,
    isLiked: false,
    createdAt: "2024-08-20T00:00:00Z",
    updatedAt: "2024-08-20T00:00:00Z",
  },
];

const MOCK_USERS: ISearchUser[] = [
  {
    user_id: "mock-user-1",
    display_name: "Luna Waves",
    bio: "Electronic music producer based in Berlin.",
    location: "Berlin",
    account_type: "Artist",
    is_private: false,
    profile_picture: null,
    cover_photo: null,
    follower_count: 12400,
    following_count: 340,
    track_count: 28,
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    user_id: "mock-user-2",
    display_name: "SolarDrift",
    bio: "Ambient and downtempo. London based.",
    location: "London",
    account_type: "Artist",
    is_private: false,
    profile_picture: null,
    cover_photo: null,
    follower_count: 8700,
    following_count: 210,
    track_count: 15,
    created_at: "2023-06-01T00:00:00Z",
  },
  {
    user_id: "mock-user-3",
    display_name: "The Wanderers",
    bio: "Indie folk duo from Nashville.",
    location: "Nashville",
    account_type: "Artist",
    is_private: false,
    profile_picture: null,
    cover_photo: null,
    follower_count: 4300,
    following_count: 120,
    track_count: 9,
    created_at: "2023-09-01T00:00:00Z",
  },
];

const MOCK_PLAYLISTS: ISearchPlaylist[] = [
  {
    playlist_id: "mock-pl-1",
    title: "Late Night Drives",
    description: "The perfect playlist for driving at night.",
    cover_photo: null,
    visibility: "public",
    track_count: 18,
    user_id: "mock-user-1",
    created_at: "2024-08-01T00:00:00Z",
  },
  {
    playlist_id: "mock-pl-2",
    title: "Morning Focus",
    description: "Ambient tracks to start your day right.",
    cover_photo: null,
    visibility: "public",
    track_count: 12,
    user_id: "mock-user-2",
    created_at: "2024-07-15T00:00:00Z",
  },
  {
    playlist_id: "mock-pl-3",
    title: "Electronic Essentials",
    description: "The best of electronic from this year.",
    cover_photo: null,
    visibility: "public",
    track_count: 24,
    user_id: "mock-user-1",
    created_at: "2024-06-10T00:00:00Z",
  },
];

// ── MOCK SERVICE ──────────────────────────────────────────────────────────────

const delay = () => new Promise((r) => setTimeout(r, 400));

export const mockSearchService: ISearchService = {
  async searchTracks(keyword: string): Promise<ITrack[]> {
    await delay();
    if (!keyword.trim()) return [];
    const kw = keyword.toLowerCase();
    return MOCK_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(kw) ||
        t.artist.toLowerCase().includes(kw) ||
        t.genre?.toLowerCase().includes(kw)
    );
  },

  async searchUsers(keyword: string): Promise<ISearchUser[]> {
    await delay();
    if (!keyword.trim()) return [];
    const kw = keyword.toLowerCase();
    return MOCK_USERS.filter(
      (u) =>
        u.display_name.toLowerCase().includes(kw) ||
        u.location?.toLowerCase().includes(kw)
    );
  },

  async searchPlaylists(keyword: string): Promise<ISearchPlaylist[]> {
    await delay();
    if (!keyword.trim()) return [];
    const kw = keyword.toLowerCase();
    return MOCK_PLAYLISTS.filter(
      (p) =>
        p.title.toLowerCase().includes(kw) ||
        p.description?.toLowerCase().includes(kw)
    );
  },

  async searchAll(keyword: string): Promise<ISearchResults> {
    if (!keyword.trim()) return { tracks: [], users: [], playlists: [] };
    const [tracks, users, playlists] = await Promise.all([
      mockSearchService.searchTracks(keyword),
      mockSearchService.searchUsers(keyword),
      mockSearchService.searchPlaylists(keyword),
    ]);
    return { tracks, users, playlists };
  },
};