/**
 * Feed Mock Service
 * Place at: services/mocks/feed.mock.ts
 */

import type { ITrack } from "@/types/track.types";
import type { IArtist } from "@/types/home.types";
import type { IFeedService, IFeedPageData } from "@/types/feed.types";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_FEED_TRACKS: ITrack[] = [
  {
    id: "feed-1",
    title: "Neon Skies",
    artist: "Luna Waves",
albumArt: "/default-track-cover.png",
    genre: "Electronic",
    description: "A hypnotic blend of synths and ambient textures.",
    url: "",
    duration: 237,
    likes: 3400,
    plays: 128000,
    commentsCount: 74,
    isLiked: false,
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "feed-2",
    title: "Drift Away",
    artist: "SolarDrift",
albumArt: "/default-track-cover.png",
    genre: "Ambient",
    description: "Peaceful ambient soundscapes for focus and calm.",
    url: "",
    duration: 312,
    likes: 1800,
    plays: 67000,
    commentsCount: 32,
    isLiked: true,
    createdAt: "2025-02-20T00:00:00Z",
    updatedAt: "2025-02-20T00:00:00Z",
  },
  {
    id: "feed-3",
    title: "Urban Echo",
    artist: "The Wanderers",
albumArt: "/default-track-cover.png",
    genre: "Indie",
    description: "City-inspired indie with raw guitar and reverb vocals.",
    url: "",
    duration: 198,
    likes: 920,
    plays: 41000,
    commentsCount: 18,
    isLiked: false,
    createdAt: "2025-02-10T00:00:00Z",
    updatedAt: "2025-02-10T00:00:00Z",
  },
  {
    id: "feed-4",
    title: "Circuit Dreams",
    artist: "Circuit Breaker",
albumArt: "/default-track-cover.png",
    genre: "Electronic",
    description: "High energy synthwave built for the late night.",
    url: "",
    duration: 274,
    likes: 2100,
    plays: 89000,
    commentsCount: 55,
    isLiked: false,
    createdAt: "2025-01-28T00:00:00Z",
    updatedAt: "2025-01-28T00:00:00Z",
  },
  {
    id: "feed-5",
    title: "Quiet Storm",
    artist: "Luna Waves",
albumArt: "/default-track-cover.png",
    genre: "Electronic",
    description: "A slower, introspective side of electronic music.",
    url: "",
    duration: 261,
    likes: 1540,
    plays: 53000,
    commentsCount: 29,
    isLiked: true,
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
];

const MOCK_FOLLOW_SUGGESTIONS: IArtist[] = [
  {
    id: "artist-1",
    name: "Luna Waves",
    followers: "12.4K",
    tracksCount: 28,
   imageUrl: "/default-avatar.png",
    type: "artist",
  },
  {
    id: "artist-2",
    name: "SolarDrift",
    followers: "8.7K",
    tracksCount: 15,
    imageUrl: "/default-avatar.png",
    type: "artist",
  },
  {
    id: "artist-3",
    name: "The Wanderers",
    followers: "4.3K",
    tracksCount: 9,
   imageUrl: "/default-avatar.png",
    type: "artist",
  },
  {
    id: "artist-4",
    name: "Circuit Breaker",
    followers: "6.1K",
    tracksCount: 21,
   imageUrl: "/default-avatar.png",
    type: "artist",
  },
];

const MOCK_HISTORY: ITrack[] = [
  {
    id: "hist-1",
    title: "Midnight Echoes",
    artist: "Luna Waves",
albumArt: "/default-track-cover.png",
    genre: "Electronic",
    description: "",
    url: "/default-avatar.png",
    duration: 214,
    likes: 1240,
    plays: 58200,
    commentsCount: 34,
    isLiked: false,
    createdAt: "2024-11-10T00:00:00Z",
    updatedAt: "2024-11-10T00:00:00Z",
  },
  {
    id: "hist-2",
    title: "City Rain",
    artist: "The Wanderers",
albumArt: "/default-track-cover.png",
    genre: "Indie",
    description: "",
    url: "/default-avatar.png",
    duration: 187,
    likes: 870,
    plays: 32100,
    commentsCount: 12,
    isLiked: true,
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "hist-3",
    title: "Golden Hour",
    artist: "SolarDrift",
albumArt: "/default-track-cover.png",
    genre: "Ambient",
    description: "",
    url: "/default-avatar.png",
    duration: 312,
    likes: 2100,
    plays: 91400,
    commentsCount: 56,
    isLiked: false,
    createdAt: "2024-09-15T00:00:00Z",
    updatedAt: "2024-09-15T00:00:00Z",
  },
];

// ── MOCK SERVICE ──────────────────────────────────────────────────────────────

const delay = () => new Promise((r) => setTimeout(r, 400));

export const mockFeedService: IFeedService = {
  async getFeedPageData(): Promise<IFeedPageData> {
    await delay();
    return {
      feedTracks:          MOCK_FEED_TRACKS,
      followSuggestions:   MOCK_FOLLOW_SUGGESTIONS,
      listeningHistory:    MOCK_HISTORY.slice(0, 3),
    };
  },

  async refreshFollowSuggestions(): Promise<IArtist[]> {
    await delay();
    // Shuffle to simulate a refresh
    return [...MOCK_FOLLOW_SUGGESTIONS].sort(() => Math.random() - 0.5);
  },
};