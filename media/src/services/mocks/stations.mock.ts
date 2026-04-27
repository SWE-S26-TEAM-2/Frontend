/**
 * Station Mock Service
 * Place at: services/mocks/stations.mock.ts
 */

import type { ITrack } from "@/types/track.types";
import type { IStation, IStationService } from "@/types/station.types";

// ── SEED TRACKS ───────────────────────────────────────────────────────────────

const SEED_TRACKS: ITrack[] = [
  {
    id: "seed-1",
    title: "Midnight Echoes",
    artist: "Luna Waves",
    albumArt: "/test.png",
    genre: "Electronic",
    description: "A deep electronic journey.",
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
    id: "seed-2",
    title: "City Rain",
    artist: "The Wanderers",
    albumArt: "test.png",
    genre: "Indie",
    description: "Late night city walks.",
    url: "",
    duration: 187,
    likes: 870,
    plays: 32100,
    commentsCount: 12,
    isLiked: false,
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "seed-3",
    title: "Golden Hour",
    artist: "SolarDrift",
    albumArt: "/test.png",
    genre: "Ambient",
    description: "Warm ambient textures.",
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
    id: "seed-4",
    title: "Neon Pulse",
    artist: "Circuit Breaker",
    albumArt: "/test.png",
    genre: "Electronic",
    description: "High energy synthwave.",
    url: "",
    duration: 253,
    likes: 540,
    plays: 19800,
    commentsCount: 8,
    isLiked: false,
    createdAt: "2024-08-20T00:00:00Z",
    updatedAt: "2024-08-20T00:00:00Z",
  },
  {
    id: "seed-5",
    title: "Drift Away",
    artist: "SolarDrift",
    albumArt: "/test.png",
    genre: "Ambient",
    description: "Peaceful ambient soundscapes.",
    url: "",
    duration: 290,
    likes: 1800,
    plays: 67000,
    commentsCount: 32,
    isLiked: false,
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2024-07-01T00:00:00Z",
  },
  {
    id: "seed-6",
    title: "Urban Echo",
    artist: "The Wanderers",
    albumArt: "/test.png",
    genre: "Indie",
    description: "City-inspired indie.",
    url: '',
    duration: 198,
    likes: 920,
    plays: 41000,
    commentsCount: 18,
    isLiked: false,
    createdAt: "2024-06-10T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
  },
];

// ── MOCK STATIONS ─────────────────────────────────────────────────────────────

const MOCK_LIKED_STATIONS: IStation[] = SEED_TRACKS.slice(0, 4).map(
  (track, i) => ({
    id:         `station-liked-${i + 1}`,
    name:       `Based on ${track.title}`,
    artistName: `${track.artist} Station`,
    coverArt:   track.albumArt,
    seedTrack:  track,
    isLiked:    true,
    genre:      track.genre,
  })
);

const MOCK_DISCOVER_STATIONS: IStation[] = SEED_TRACKS.map((track, i) => ({
  id:         `station-discover-${i + 1}`,
  name:       `Based on ${track.title}`,
  artistName: `${track.artist} Station`,
  coverArt:   track.albumArt,
  seedTrack:  track,
  isLiked:    i < 2,
  genre:      track.genre,
}));

// ── MOCK SERVICE ──────────────────────────────────────────────────────────────

const delay = () => new Promise((r) => setTimeout(r, 400));

export const mockStationService: IStationService = {
  async getLikedStations(): Promise<IStation[]> {
    await delay();
    return MOCK_LIKED_STATIONS;
  },

  async getDiscoverStations(): Promise<IStation[]> {
    await delay();
    return MOCK_DISCOVER_STATIONS;
  },

  async toggleLike(stationId: string): Promise<void> {
    await delay();
    const station =
      MOCK_LIKED_STATIONS.find((s) => s.id === stationId) ??
      MOCK_DISCOVER_STATIONS.find((s) => s.id === stationId);
    if (station) station.isLiked = !station.isLiked;
  },
};