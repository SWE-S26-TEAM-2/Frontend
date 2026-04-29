/**
 * playlistMockData.test.ts
 *
 * Tests for getMockPlaylistById and the pure track array management helpers.
 */

import {
  getMockPlaylistById,
  addTrackToList,
  removeTrackFromList,
  reorderTracks,
} from "@/services/mocks/playlistMockData";
import { IPlaylistTrack } from "@/types/playlist.types";

// ── getMockPlaylistById ────────────────────────────────────────
describe("getMockPlaylistById", () => {
  it("returns the correct playlist for id 123", () => {
    const p = getMockPlaylistById("123");
    expect(p).not.toBeNull();
    expect(p?.title).toBe("Midnight Frequencies");
    expect(p?.id).toBe("123");
  });

  it("returns a different playlist for id 456", () => {
    const p = getMockPlaylistById("456");
    expect(p).not.toBeNull();
    expect(p?.title).toBe("Solar Bloom");
  });

  it("returns a different playlist for id 789", () => {
    const p = getMockPlaylistById("789");
    expect(p).not.toBeNull();
    expect(p?.title).toBe("Deep Focus");
  });

  it("returns null for an unknown id", () => {
    expect(getMockPlaylistById("9999")).toBeNull();
    expect(getMockPlaylistById("invalid-id")).toBeNull();
    expect(getMockPlaylistById("")).toBeNull();
  });

  it("each playlist has the correct id property", () => {
    expect(getMockPlaylistById("123")?.id).toBe("123");
    expect(getMockPlaylistById("456")?.id).toBe("456");
    expect(getMockPlaylistById("789")?.id).toBe("789");
  });
});

// ── Track helpers ──────────────────────────────────────────────
const T1: IPlaylistTrack = { id: "t1", title: "One",   artist: "A", albumArt: "/a.jpg", duration: 100 };
const T2: IPlaylistTrack = { id: "t2", title: "Two",   artist: "B", albumArt: "/b.jpg", duration: 200 };
const T3: IPlaylistTrack = { id: "t3", title: "Three", artist: "C", albumArt: "/c.jpg", duration: 300 };

describe("addTrackToList", () => {
  it("appends a new track", () => {
    const result = addTrackToList([T1, T2], T3);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual(T3);
  });

  it("does not mutate the original array", () => {
    const original = [T1, T2];
    addTrackToList(original, T3);
    expect(original).toHaveLength(2);
  });

  it("does not add a duplicate", () => {
    expect(addTrackToList([T1, T2], T1)).toHaveLength(2);
  });
});

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
});

describe("reorderTracks", () => {
  it("moves a track forward", () => {
    const result = reorderTracks([T1, T2, T3], 0, 2);
    expect(result.map((t) => t.id)).toEqual(["t2", "t3", "t1"]);
  });

  it("moves a track backward", () => {
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

  it("returns unchanged array for out-of-bounds indices", () => {
    expect(reorderTracks([T1, T2], -1, 1)).toHaveLength(2);
    expect(reorderTracks([T1, T2], 0, 5)).toHaveLength(2);
  });
});
