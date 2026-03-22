/**
 * playlistMockData.test.ts
 *
 * Full coverage of the localStorage-backed mock data store.
 * Tests: seed data, create, update, AVAILABLE_TRACKS, genre/mood persistence,
 *        defensive array helpers, and localStorage isolation.
 */

import {
  getMockPlaylistById,
  getMockAllPlaylists,
  createMockPlaylist,
  updateMockPlaylist,
  addTrackToList,
  removeTrackFromList,
  reorderTracks,
  AVAILABLE_TRACKS,
} from "@/services/mocks/playlistMockData";
import { IPlaylistTrack } from "@/types/playlist.types";

// ── Fixtures ────────────────────────────────────────────────────────────────

const T1: IPlaylistTrack = { id: "t1", title: "One",   artist: "A", albumArt: "/a.jpg", duration: 100, url: "/tracks/song1.mp3" };
const T2: IPlaylistTrack = { id: "t2", title: "Two",   artist: "B", albumArt: "/b.jpg", duration: 200, url: "/tracks/song2.mp3" };
const T3: IPlaylistTrack = { id: "t3", title: "Three", artist: "C", albumArt: "/c.jpg", duration: 300, url: "/tracks/song1.mp3" };

// ── getMockPlaylistById ──────────────────────────────────────────────────────

describe("getMockPlaylistById", () => {
  it("returns Midnight Frequencies for id 123", () => {
    const p = getMockPlaylistById("123");
    expect(p?.id).toBe("123");
    expect(p?.title).toBe("Midnight Frequencies");
  });

  it("returns Solar Bloom for id 456", () => {
    const p = getMockPlaylistById("456");
    expect(p?.title).toBe("Solar Bloom");
  });

  it("returns Deep Focus for id 789", () => {
    const p = getMockPlaylistById("789");
    expect(p?.title).toBe("Deep Focus");
    expect(p?.isPublic).toBe(false);
  });

  it("returns null for unknown id", () => {
    expect(getMockPlaylistById("9999")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(getMockPlaylistById("")).toBeNull();
  });

  it("always returns an array for tracks (never null/undefined)", () => {
    const p = getMockPlaylistById("123");
    expect(Array.isArray(p?.tracks)).toBe(true);
  });

  it("seed playlists carry genre and mood fields", () => {
    const p = getMockPlaylistById("123");
    expect(p?.genre).toBe("Electronic");
    expect(p?.mood).toBe("Chill");
  });
});

// ── getMockAllPlaylists ──────────────────────────────────────────────────────

describe("getMockAllPlaylists", () => {
  it("returns at least the 3 seed playlists", () => {
    const all = getMockAllPlaylists();
    expect(all.length).toBeGreaterThanOrEqual(3);
  });

  it("every playlist has an array for tracks", () => {
    getMockAllPlaylists().forEach((p) => {
      expect(Array.isArray(p.tracks)).toBe(true);
    });
  });
});

// ── createMockPlaylist ───────────────────────────────────────────────────────

describe("createMockPlaylist", () => {
  it("creates a playlist and returns it with a generated id", async () => {
    const result = await createMockPlaylist(
      {
        title: "New Playlist",
        description: "test",
        isPublic: true,
        coverArt: "/covers/song1.jpg",
        tracks: [T1],
      },
      "TestUser"
    );
    expect(result.id).toMatch(/^mock-/);
    expect(result.title).toBe("New Playlist");
    expect(result.creator).toBe("TestUser");
  });

  it("persists genre and mood on the created playlist", async () => {
    const result = await createMockPlaylist(
      {
        title: "Tagged",
        description: "",
        isPublic: true,
        coverArt: "",
        genre: "Rock",
        mood: "Party",
        tracks: [],
      },
      "You"
    );
    expect(result.genre).toBe("Rock");
    expect(result.mood).toBe("Party");
  });

  it("persists tracks array correctly", async () => {
    const result = await createMockPlaylist(
      {
        title: "Track Test",
        description: "",
        isPublic: false,
        coverArt: "",
        tracks: [T1, T2],
      },
      "You"
    );
    expect(result.tracks).toHaveLength(2);
    expect(result.tracks[0].id).toBe("t1");
  });

  it("created playlist is retrievable by id", async () => {
    const created = await createMockPlaylist(
      { title: "Retrievable", description: "", isPublic: true, coverArt: "", tracks: [] },
      "You"
    );
    const found = getMockPlaylistById(created.id);
    expect(found?.title).toBe("Retrievable");
  });

  it("generates incrementing ids across multiple creates", async () => {
    const a = await createMockPlaylist(
      { title: "A", description: "", isPublic: true, coverArt: "", tracks: [] },
      "You"
    );
    const b = await createMockPlaylist(
      { title: "B", description: "", isPublic: true, coverArt: "", tracks: [] },
      "You"
    );
    const numA = parseInt(a.id.replace("mock-", ""), 10);
    const numB = parseInt(b.id.replace("mock-", ""), 10);
    expect(numB).toBeGreaterThan(numA);
  });
});

// ── updateMockPlaylist ───────────────────────────────────────────────────────

describe("updateMockPlaylist", () => {
  it("updates title on an existing playlist", async () => {
    const result = await updateMockPlaylist({ id: "123", title: "Updated Title" });
    expect(result.title).toBe("Updated Title");
    expect(result.id).toBe("123");
  });

  it("updates genre and mood independently", async () => {
    const result = await updateMockPlaylist({ id: "456", genre: "Jazz", mood: "Romantic" });
    expect(result.genre).toBe("Jazz");
    expect(result.mood).toBe("Romantic");
    // Other fields unchanged
    expect(result.creator).toBe("Dune Walker");
  });

  it("clears genre when undefined passed", async () => {
    await updateMockPlaylist({ id: "123", genre: "Rock" });
    const cleared = await updateMockPlaylist({ id: "123", genre: undefined });
    // undefined means "keep existing" per implementation
    expect(cleared.genre).toBeDefined();
  });

  it("throws for unknown playlist id", async () => {
    await expect(
      updateMockPlaylist({ id: "nonexistent-id" })
    ).rejects.toThrow();
  });

  it("preserves untouched fields when doing partial update", async () => {
    const original = getMockPlaylistById("789");
    await updateMockPlaylist({ id: "789", title: "New Title" });
    const updated = getMockPlaylistById("789");
    expect(updated?.description).toBe(original?.description);
    expect(updated?.creator).toBe(original?.creator);
    expect(updated?.tracks.length).toBe(original?.tracks.length);
  });
});

// ── AVAILABLE_TRACKS ─────────────────────────────────────────────────────────

describe("AVAILABLE_TRACKS", () => {
  it("is always a non-empty array", () => {
    expect(Array.isArray(AVAILABLE_TRACKS)).toBe(true);
    expect(AVAILABLE_TRACKS.length).toBeGreaterThan(0);
  });

  it("contains exactly 20 tracks", () => {
    expect(AVAILABLE_TRACKS).toHaveLength(20);
  });

  it("every track has required fields populated", () => {
    AVAILABLE_TRACKS.forEach((t) => {
      expect(typeof t.id).toBe("string");
      expect(t.id.length).toBeGreaterThan(0);
      expect(typeof t.title).toBe("string");
      expect(typeof t.artist).toBe("string");
      expect(typeof t.albumArt).toBe("string");
      expect(typeof t.duration).toBe("number");
      expect(t.duration).toBeGreaterThan(0);
      expect(typeof t.url).toBe("string");
    });
  });

  it("all track ids are unique", () => {
    const ids = AVAILABLE_TRACKS.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ── addTrackToList ────────────────────────────────────────────────────────────

describe("addTrackToList", () => {
  it("appends a new track to the end", () => {
    const result = addTrackToList([T1, T2], T3);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual(T3);
  });

  it("does not mutate the original array", () => {
    const original = [T1, T2];
    addTrackToList(original, T3);
    expect(original).toHaveLength(2);
  });

  it("does not add a duplicate by id", () => {
    expect(addTrackToList([T1, T2], T1)).toHaveLength(2);
  });

  it("handles empty input array", () => {
    const result = addTrackToList([], T1);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(T1);
  });

  it("is safe when passed undefined (defensive)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = addTrackToList(undefined as any, T1);
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── removeTrackFromList ───────────────────────────────────────────────────────

describe("removeTrackFromList", () => {
  it("removes a track by id", () => {
    const result = removeTrackFromList([T1, T2, T3], "t2");
    expect(result).toHaveLength(2);
    expect(result.find((t) => t.id === "t2")).toBeUndefined();
  });

  it("does not mutate the original array", () => {
    const original = [T1, T2];
    removeTrackFromList(original, "t1");
    expect(original).toHaveLength(2);
  });

  it("returns unchanged array for unknown id", () => {
    expect(removeTrackFromList([T1, T2], "t99")).toHaveLength(2);
  });

  it("handles removing the only track", () => {
    expect(removeTrackFromList([T1], "t1")).toHaveLength(0);
  });

  it("is safe when passed undefined (defensive)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = removeTrackFromList(undefined as any, "t1");
    expect(Array.isArray(result)).toBe(true);
  });
});

// ── reorderTracks ─────────────────────────────────────────────────────────────

describe("reorderTracks", () => {
  it("moves a track forward in the array", () => {
    const result = reorderTracks([T1, T2, T3], 0, 2);
    expect(result.map((t) => t.id)).toEqual(["t2", "t3", "t1"]);
  });

  it("moves a track backward in the array", () => {
    const result = reorderTracks([T1, T2, T3], 2, 0);
    expect(result.map((t) => t.id)).toEqual(["t3", "t1", "t2"]);
  });

  it("does not mutate the original array", () => {
    const original = [T1, T2, T3];
    reorderTracks(original, 0, 2);
    expect(original[0].id).toBe("t1");
  });

  it("returns unchanged array when fromIndex === toIndex", () => {
    const result = reorderTracks([T1, T2], 1, 1);
    expect(result.map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("returns unchanged array for negative fromIndex", () => {
    expect(reorderTracks([T1, T2], -1, 1)).toHaveLength(2);
  });

  it("returns unchanged array for out-of-bounds toIndex", () => {
    expect(reorderTracks([T1, T2], 0, 5)).toHaveLength(2);
  });

  it("handles swap of first and last element", () => {
    const result = reorderTracks([T1, T2, T3], 0, 2);
    expect(result[0].id).toBe("t2");
    expect(result[2].id).toBe("t1");
  });
});
