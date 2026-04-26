// src/services/mocks/library.mock.ts

import type {
  ILibraryService,
  ILibraryOverview,
  ILibraryTrack,
  ILibraryPlaylist,
  ILibraryAlbum,
  ILibraryStation,
  ILibraryFollowing,
} from "@/types/library.types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Auth helpers (SSR-safe, matches apiClient.ts pattern) ───────────────────

/**
 * Reads the logged-in user's username from localStorage.
 * auth.api.ts saves it under "auth_username" after login/googleLogin.
 */
const getMockCurrentUsername = (): string => {
  if (typeof window === "undefined") return "you";
  return window.localStorage.getItem("auth_username") ?? "you";
};

/**
 * Reads the logged-in user's id from localStorage.
 * auth.api.ts saves it under "auth_user_id" after login/googleLogin.
 */
const getMockCurrentUserId = (): string => {
  if (typeof window === "undefined") return "current-user";
  return window.localStorage.getItem("auth_user_id") ?? "current-user";
};

// ─── Waveform seed generator ─────────────────────────────────────────────────
// Produces a stable normalized (0–1) waveform array from a string seed.
// This replaces the inline WaveformPlaceholder in page.tsx — data is now
// part of the track so the shared <Waveform> component can consume it.
function generateWaveformData(seed: string, bars = 100): number[] {
  return Array.from({ length: bars }, (_, i) => {
    const s = seed.charCodeAt(i % seed.length);
    const raw = 0.15 + Math.abs(Math.sin(i * 0.5 + s) * 0.4) + Math.abs(Math.cos(i * 0.3 + s) * 0.25);
    return Math.min(1, raw); // clamp to 0–1 as IWaveformProps expects
  });
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

/**
 * Recently-played items are user-specific: the first entry is always the
 * logged-in user's own profile so the link and label are correct for everyone.
 */
const buildMockRecentItems = () => {
  const username = getMockCurrentUsername();
  const userId   = getMockCurrentUserId();
  return [
    { id: "r1", type: "user"     as const, label: username,          coverUrl: null, accentColor: "#1a6db5", href: `/users/${userId}` },
    { id: "r2", type: "track"    as const, label: "Side To Side",    coverUrl: null, accentColor: "#1a1a2e", href: "/track/1" },
    { id: "r3", type: "track"    as const, label: "One Last Time",   coverUrl: null, accentColor: "#8B4513", href: "/track/2" },
    { id: "r4", type: "playlist" as const, label: "Chill Mix",       coverUrl: null, accentColor: "#1c3a1c", href: "/playlist/1" },
    { id: "r5", type: "track"    as const, label: "Dark Souls OST",  coverUrl: null, accentColor: "#2c3e50", href: "/track/3" },
    { id: "r6", type: "track"    as const, label: "Hollow Knight",   coverUrl: null, accentColor: "#3d1a5c", href: "/track/4" },
  ];
};

const MOCK_LIKES: ILibraryTrack[] = [
  {
    id: "l1",
    title: "Ariana Grande - Side To Side Ft. Nicki Minaj (Remix)",
    artist: "Kelvin Dewy",
    coverUrl: null,
    accentColor: "#1a1a2e",
    plays: 26_300_000,
    likes: 330_000,
    reposts: 10_600,
    likedAt: "2015-01-01",
    genre: "ArianaGrande",
    waveformData: generateWaveformData("l1"),
  },
  {
    id: "l2",
    title: "One Last Time - Ariana Grande",
    artist: "MolMol",
    coverUrl: null,
    accentColor: "#8B4513",
    plays: 19_400_000,
    likes: 271_000,
    reposts: 8_470,
    likedAt: "2014-01-01",
    genre: "arianagrande",
    waveformData: generateWaveformData("l2"),
  },
  {
    id: "l3",
    title: "Dark Souls 3 OST + DLC",
    artist: "mitchteck",
    coverUrl: null,
    accentColor: "#2c3e50",
    plays: 5_000_000,
    likes: 89_000,
    reposts: 1_200,
    waveformData: generateWaveformData("l3"),
  },
  {
    id: "l4",
    title: "For Those Who Come After",
    artist: "Lorien T.",
    coverUrl: null,
    accentColor: "#1a252f",
    plays: 312_000,
    likes: 5_140,
    reposts: 70,
    waveformData: generateWaveformData("l4"),
  },
];

const MOCK_PLAYLISTS: ILibraryPlaylist[] = [
  { id: "p1", title: "Chill Vibes",      trackCount: 12, coverUrl: null, accentColor: "#1c3a1c" },
  { id: "p2", title: "Gaming OSTs",      trackCount: 34, coverUrl: null, accentColor: "#2c3e50" },
  { id: "p3", title: "Late Night Drive", trackCount: 8,  coverUrl: null, accentColor: "#1a1a2e" },
  { id: "p4", title: "Morning Energy",   trackCount: 15, coverUrl: null, accentColor: "#8B4513" },
  { id: "p5", title: "Study Session",    trackCount: 22, coverUrl: null, accentColor: "#3d1a5c" },
  { id: "p6", title: "Workout Bangers",  trackCount: 18, coverUrl: null, accentColor: "#1a3a1a" },
];

const MOCK_ALBUMS: ILibraryAlbum[] = [
  { id: "a1", title: "thank u, next",     artist: "Ariana Grande",     trackCount: 12, coverUrl: null, accentColor: "#c0392b" },
  { id: "a2", title: "Positions",         artist: "Ariana Grande",     trackCount: 14, coverUrl: null, accentColor: "#8e44ad" },
  { id: "a3", title: "Hollow Knight OST", artist: "Christopher Larkin",trackCount: 30, coverUrl: null, accentColor: "#3d1a5c" },
  { id: "a4", title: "Dark Souls III",    artist: "Motoi Sakuraba",    trackCount: 45, coverUrl: null, accentColor: "#2c3e50" },
  { id: "a5", title: "Positions Deluxe",  artist: "Ariana Grande",     trackCount: 16, coverUrl: null, accentColor: "#6c3483" },
  { id: "a6", title: "Sweetener",         artist: "Ariana Grande",     trackCount: 15, coverUrl: null, accentColor: "#d35400" },
];

const MOCK_STATIONS: ILibraryStation[] = [
  { id: "s1", title: "AmrDiab",          subtitle: "Artist station",   coverUrl: null, accentColor: "#b03060" },
  { id: "s2", title: "Ariana Grande",    subtitle: "Artist station",   coverUrl: null, accentColor: "#c0392b" },
  { id: "s3", title: "Chill Electronic", subtitle: "Genre station",    coverUrl: null, accentColor: "#1a3a5c" },
  { id: "s4", title: "Gaming OST Mix",   subtitle: "Playlist station", coverUrl: null, accentColor: "#2c3e50" },
  { id: "s5", title: "Mariah Carey",     subtitle: "Artist station",   coverUrl: null, accentColor: "#8B1a1a" },
  { id: "s6", title: "Late Night Jazz",  subtitle: "Genre station",    coverUrl: null, accentColor: "#1a1a2e" },
];

const MOCK_FOLLOWING: ILibraryFollowing[] = [
  { id: "fo1", username: "Mariah Carey",  avatarUrl: null, followers: 678_000,   isVerified: true },
  { id: "fo2", username: "Selena Gomez",  avatarUrl: null, followers: 370_000,   isVerified: true },
  { id: "fo3", username: "Ariana Grande", avatarUrl: null, followers: 2_100_000, isVerified: true },
  { id: "fo4", username: "Miley Cyrus",   avatarUrl: null, followers: 1_440_000, isVerified: true },
  { id: "fo5", username: "Maroon 5",      avatarUrl: null, followers: 1_760_000, isVerified: true },
  { id: "fo6", username: "AmrDiab",       avatarUrl: null, followers: 890_000,   isVerified: true },
];

// ─── Mock Service ─────────────────────────────────────────────────────────────

export const mockLibraryService: ILibraryService = {
  async getOverview(): Promise<ILibraryOverview> {
    await delay(350);
    return {
      recentlyPlayed: buildMockRecentItems(), // FIX: built dynamically so username/href are correct per user
      likes:          MOCK_LIKES,
      playlists:      MOCK_PLAYLISTS,
      albums:         MOCK_ALBUMS,
      stations:       MOCK_STATIONS,
      following:      MOCK_FOLLOWING,
    };
  },

  async getLikes():     Promise<ILibraryTrack[]>     { await delay(300); return MOCK_LIKES; },
  async getPlaylists(): Promise<ILibraryPlaylist[]>  { await delay(300); return MOCK_PLAYLISTS; },
  async getAlbums():    Promise<ILibraryAlbum[]>     { await delay(300); return MOCK_ALBUMS; },
  async getStations():  Promise<ILibraryStation[]>   { await delay(300); return MOCK_STATIONS; },
  async getFollowing(): Promise<ILibraryFollowing[]> { await delay(300); return MOCK_FOLLOWING; },

  // FIX: clearHistory was missing — stub clears nothing in mock (no persistence), just resolves
  async clearHistory(): Promise<void> {
    await delay(200);
    // In mock mode there is no persistent history state, so this is intentionally a no-op.
    // TODO: if a recentlyPlayed state slice is added, reset it here.
  },
};