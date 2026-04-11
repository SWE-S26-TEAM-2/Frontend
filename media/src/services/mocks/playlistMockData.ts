/**
 * Mock playlist data — localStorage-backed in-memory store.
 *
 * Tier 1 updates:
 *  - Seed playlists carry genre + mood
 *  - createMockPlaylist and updateMockPlaylist persist genre + mood
 *  - All array operations guarded with Array.isArray
 */

import {
  IPlaylist,
  IPlaylistTrack,
  IPlaylistCreateInput,
  IPlaylistUpdateInput,
} from "@/types/playlist.types";
import {
  PLAYLIST_MOCK_DELAY_MS,
  PLAYLIST_MOCK_ID_PREFIX,
} from "@/constants/playlist.constants";

const LS_KEY = "sc_mock_playlists";

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_PLAYLISTS: Record<string, IPlaylist> = {
  "123": {
    id: "123",
    title: "Midnight Frequencies",
    description:
      "A curated journey through late-night electronic sounds and ambient textures.",
    coverArt: "/covers/song1.jpg",
    creator: "Aurora Vex",
    isPublic: true,
    genre: "Electronic",
    mood: "Chill",
    tracks: [
      { id: "t1", title: "Neon Drift",        artist: "HΛLOGEN",           albumArt: "/covers/song1.jpg", duration: 214, url: "/tracks/song1.mp3" },
      { id: "t2", title: "Subzero Bloom",     artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 187, url: "/tracks/song2.mp3" },
      { id: "t3", title: "Glass Meridian",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 302, url: "/tracks/song1.mp3" },
      { id: "t4", title: "Ultraviolet Shore", artist: "HΛLOGEN",           albumArt: "/covers/song2.jpg", duration: 245, url: "/tracks/song2.mp3" },
      { id: "t5", title: "Signal Loss",       artist: "The Static Garden", albumArt: "/covers/song1.jpg", duration: 198, url: "/tracks/song1.mp3" },
      { id: "t6", title: "Phantom Latitude",  artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 273, url: "/tracks/song2.mp3" },
      { id: "t7", title: "Ember Protocol",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 221, url: "/tracks/song1.mp3" },
    ],
  },
  "456": {
    id: "456",
    title: "Solar Bloom",
    description: "Warm, sun-drenched indie tracks for long summer drives.",
    coverArt: "/covers/song2.jpg",
    creator: "Dune Walker",
    isPublic: true,
    genre: "Pop",
    mood: "Happy",
    tracks: [
      { id: "s1", title: "Golden Hour",    artist: "The Coasts",  albumArt: "/covers/song2.jpg", duration: 203, url: "/tracks/song2.mp3" },
      { id: "s2", title: "Drift",          artist: "Pale Sun",    albumArt: "/covers/song1.jpg", duration: 178, url: "/tracks/song1.mp3" },
      { id: "s3", title: "Salt & Sky",     artist: "The Coasts",  albumArt: "/covers/song2.jpg", duration: 241, url: "/tracks/song2.mp3" },
      { id: "s4", title: "Barefoot Radio", artist: "Oceanside",   albumArt: "/covers/song1.jpg", duration: 195, url: "/tracks/song1.mp3" },
      { id: "s5", title: "Sundowner",      artist: "Pale Sun",    albumArt: "/covers/song2.jpg", duration: 260, url: "/tracks/song2.mp3" },
    ],
  },
  "789": {
    id: "789",
    title: "Deep Focus",
    description: "Minimal, instrumental music engineered for concentration.",
    coverArt: "/covers/song1.jpg",
    creator: "Flowstate",
    isPublic: false,
    genre: "Ambient",
    mood: "Focus",
    tracks: [
      { id: "f1", title: "Clarity",     artist: "Null Space", albumArt: "/covers/song1.jpg", duration: 360, url: "/tracks/song1.mp3" },
      { id: "f2", title: "White Walls", artist: "Monochrome", albumArt: "/covers/song2.jpg", duration: 420, url: "/tracks/song2.mp3" },
      { id: "f3", title: "Low Tide",    artist: "Null Space", albumArt: "/covers/song1.jpg", duration: 311, url: "/tracks/song1.mp3" },
    ],
  },
};

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadFromStorage(): Record<string, IPlaylist> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, IPlaylist>;
    // Defensive: ensure every playlist has an array for tracks
    Object.values(parsed).forEach((pl) => {
      if (!Array.isArray(pl.tracks)) pl.tracks = [];
    });
    return parsed;
  } catch {
    return {};
  }
}

function saveToStorage(store: Record<string, IPlaylist>): void {
  if (typeof window === "undefined") return;
  try {
    const userPlaylists = Object.fromEntries(
      Object.entries(store).filter(([id]) => id.startsWith(PLAYLIST_MOCK_ID_PREFIX))
    );
    window.localStorage.setItem(LS_KEY, JSON.stringify(userPlaylists));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

function buildStore(): Record<string, IPlaylist> {
  return { ...SEED_PLAYLISTS, ...loadFromStorage() };
}

const MOCK_STORE: Record<string, IPlaylist> = buildStore();

function getNextId(): string {
  const existing = Object.keys(loadFromStorage())
    .filter((id) => id.startsWith(PLAYLIST_MOCK_ID_PREFIX))
    .map((id) => parseInt(id.replace(PLAYLIST_MOCK_ID_PREFIX, ""), 10))
    .filter((n) => !isNaN(n));
  const maxId = existing.length > 0 ? Math.max(...existing) : 1000;
  return `${PLAYLIST_MOCK_ID_PREFIX}${maxId + 1}`;
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Read ──────────────────────────────────────────────────────────────────────

export function getMockPlaylistById(id: string): IPlaylist | null {
  const fresh = loadFromStorage();
  Object.assign(MOCK_STORE, fresh);
  const pl = MOCK_STORE[id] ?? null;
  if (pl && !Array.isArray(pl.tracks)) pl.tracks = [];
  return pl;
}

export function getMockAllPlaylists(): IPlaylist[] {
  const fresh = loadFromStorage();
  Object.assign(MOCK_STORE, fresh);
  return Object.values(MOCK_STORE).map((pl) => ({
    ...pl,
    tracks: Array.isArray(pl.tracks) ? pl.tracks : [],
  }));
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createMockPlaylist(
  input: IPlaylistCreateInput,
  creatorName: string
): Promise<IPlaylist> {
  await delay(PLAYLIST_MOCK_DELAY_MS);
  const newId = getNextId();
  const playlist: IPlaylist = {
    id:          newId,
    title:       input.title,
    description: input.description,
    coverArt:    input.coverArt || "/covers/song1.jpg",
    creator:     creatorName,
    isPublic:    input.isPublic,
    genre:       input.genre,
    mood:        input.mood,
    tracks:      Array.isArray(input.tracks) ? input.tracks : [],
  };
  MOCK_STORE[newId] = playlist;
  saveToStorage(MOCK_STORE);
  return playlist;
}

export async function updateMockPlaylist(
  input: IPlaylistUpdateInput
): Promise<IPlaylist> {
  await delay(PLAYLIST_MOCK_DELAY_MS);
  const existing = MOCK_STORE[input.id];
  if (!existing) throw new Error(`Playlist "${input.id}" not found.`);

  const updated: IPlaylist = {
    ...existing,
    title:       input.title       ?? existing.title,
    description: input.description ?? existing.description,
    coverArt:    input.coverArt    ?? existing.coverArt,
    isPublic:    input.isPublic    ?? existing.isPublic,
    genre:       input.genre  !== undefined ? input.genre  : existing.genre,
    mood:        input.mood   !== undefined ? input.mood   : existing.mood,
    tracks:      Array.isArray(input.tracks)    ? input.tracks
               : Array.isArray(existing.tracks) ? existing.tracks
               : [],
  };
  MOCK_STORE[input.id] = updated;
  saveToStorage(MOCK_STORE);
  return updated;
}

// ── Available tracks catalogue ────────────────────────────────────────────────

export const AVAILABLE_TRACKS: IPlaylistTrack[] = [
  { id: "t1", title: "Neon Drift",        artist: "HΛLOGEN",           albumArt: "/covers/song1.jpg", duration: 214, url: "/tracks/song1.mp3" },
  { id: "t2", title: "Subzero Bloom",     artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 187, url: "/tracks/song2.mp3" },
  { id: "t3", title: "Glass Meridian",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 302, url: "/tracks/song1.mp3" },
  { id: "t4", title: "Ultraviolet Shore", artist: "HΛLOGEN",           albumArt: "/covers/song2.jpg", duration: 245, url: "/tracks/song2.mp3" },
  { id: "t5", title: "Signal Loss",       artist: "The Static Garden", albumArt: "/covers/song1.jpg", duration: 198, url: "/tracks/song1.mp3" },
  { id: "t6", title: "Phantom Latitude",  artist: "Crestfallen",       albumArt: "/covers/song2.jpg", duration: 273, url: "/tracks/song2.mp3" },
  { id: "t7", title: "Ember Protocol",    artist: "Faulkner & Mist",   albumArt: "/covers/song1.jpg", duration: 221, url: "/tracks/song1.mp3" },
  { id: "s1", title: "Golden Hour",       artist: "The Coasts",        albumArt: "/covers/song2.jpg", duration: 203, url: "/tracks/song2.mp3" },
  { id: "s2", title: "Drift",             artist: "Pale Sun",          albumArt: "/covers/song1.jpg", duration: 178, url: "/tracks/song1.mp3" },
  { id: "s3", title: "Salt & Sky",        artist: "The Coasts",        albumArt: "/covers/song2.jpg", duration: 241, url: "/tracks/song2.mp3" },
  { id: "s4", title: "Barefoot Radio",    artist: "Oceanside",         albumArt: "/covers/song1.jpg", duration: 195, url: "/tracks/song1.mp3" },
  { id: "s5", title: "Sundowner",         artist: "Pale Sun",          albumArt: "/covers/song2.jpg", duration: 260, url: "/tracks/song2.mp3" },
  { id: "f1", title: "Clarity",           artist: "Null Space",        albumArt: "/covers/song1.jpg", duration: 360, url: "/tracks/song1.mp3" },
  { id: "f2", title: "White Walls",       artist: "Monochrome",        albumArt: "/covers/song2.jpg", duration: 420, url: "/tracks/song2.mp3" },
  { id: "f3", title: "Low Tide",          artist: "Null Space",        albumArt: "/covers/song1.jpg", duration: 311, url: "/tracks/song1.mp3" },
  { id: "x1", title: "Afterglow",         artist: "Vessel",            albumArt: "/covers/song2.jpg", duration: 232, url: "/tracks/song2.mp3" },
  { id: "x2", title: "Cascade",           artist: "Vessel",            albumArt: "/covers/song2.jpg", duration: 198, url: "/tracks/song2.mp3" },
  { id: "x3", title: "Iron Sky",          artist: "Meridian Arc",      albumArt: "/covers/song1.jpg", duration: 285, url: "/tracks/song1.mp3" },
  { id: "x4", title: "Hollow Point",      artist: "Meridian Arc",      albumArt: "/covers/song2.jpg", duration: 263, url: "/tracks/song2.mp3" },
  { id: "x5", title: "Prismatic",         artist: "Solstice",          albumArt: "/covers/song1.jpg", duration: 312, url: "/tracks/song1.mp3" },
];

// ── Array helpers ─────────────────────────────────────────────────────────────

export function addTrackToList(
  tracks: IPlaylistTrack[],
  track: IPlaylistTrack
): IPlaylistTrack[] {
  const safeArr = Array.isArray(tracks) ? tracks : [];
  if (safeArr.some((t) => t.id === track.id)) return safeArr;
  return [...safeArr, track];
}

export function removeTrackFromList(
  tracks: IPlaylistTrack[],
  trackId: string
): IPlaylistTrack[] {
  return (Array.isArray(tracks) ? tracks : []).filter((t) => t.id !== trackId);
}

export function reorderTracks(
  tracks: IPlaylistTrack[],
  fromIndex: number,
  toIndex: number
): IPlaylistTrack[] {
  const safeArr = Array.isArray(tracks) ? tracks : [];
  if (
    fromIndex < 0 || toIndex < 0 ||
    fromIndex >= safeArr.length || toIndex >= safeArr.length ||
    fromIndex === toIndex
  ) return safeArr;
  const result = [...safeArr];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}
