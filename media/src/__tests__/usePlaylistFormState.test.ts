/**
 * usePlaylistFormState.test.ts
 *
 * Full coverage of the form field state hook.
 * Tests: initial state, field handlers, dirty tracking,
 *        validation helpers, undo-remove, hydration, totalDuration, addedTrackIds.
 */

import { renderHook, act } from "@testing-library/react";
import {
  usePlaylistFormState,
  validatePlaylistForm,
  hasFormErrors,
} from "@/hooks/usePlaylistFormState";
import { IPlaylistTrack } from "@/types/playlist.types";

// ── Mock playlistMockData helpers ─────────────────────────────────────────────
jest.mock("@/services/mocks/playlistMockData", () => ({
  addTrackToList: jest.fn((tracks: IPlaylistTrack[], track: IPlaylistTrack) => {
    if (!Array.isArray(tracks)) return [track];
    if (tracks.some((t) => t.id === track.id)) return tracks;
    return [...tracks, track];
  }),
  removeTrackFromList: jest.fn((tracks: IPlaylistTrack[], id: string) =>
    (Array.isArray(tracks) ? tracks : []).filter((t) => t.id !== id)
  ),
  reorderTracks: jest.fn((tracks: IPlaylistTrack[], from: number, to: number) => {
    const arr = [...(Array.isArray(tracks) ? tracks : [])];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    return arr;
  }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────
const T1: IPlaylistTrack = { id: "t1", title: "Alpha", artist: "A", albumArt: "/a.jpg", duration: 120, url: "/tracks/song1.mp3" };
const T2: IPlaylistTrack = { id: "t2", title: "Beta",  artist: "B", albumArt: "/b.jpg", duration: 180, url: "/tracks/song2.mp3" };
const T3: IPlaylistTrack = { id: "t3", title: "Gamma", artist: "C", albumArt: "/c.jpg", duration: 240, url: "/tracks/song1.mp3" };

// ── Pure validation helpers ───────────────────────────────────────────────────

describe("validatePlaylistForm", () => {
  it("returns no errors for valid input", () => {
    const errors = validatePlaylistForm("Valid Title", [T1]);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("requires a non-empty title", () => {
    const errors = validatePlaylistForm("", [T1]);
    expect(errors.title).toBeDefined();
  });

  it("rejects whitespace-only title", () => {
    expect(validatePlaylistForm("   ", [T1]).title).toBeDefined();
  });

  it("rejects title longer than 100 characters", () => {
    const longTitle = "a".repeat(101);
    expect(validatePlaylistForm(longTitle, [T1]).title).toBeDefined();
  });

  it("accepts title of exactly 100 characters", () => {
    const maxTitle = "a".repeat(100);
    expect(validatePlaylistForm(maxTitle, [T1]).title).toBeUndefined();
  });

  it("requires at least 1 track", () => {
    const errors = validatePlaylistForm("Title", []);
    expect(errors.tracks).toBeDefined();
  });

  it("accepts 1 track as valid", () => {
    expect(validatePlaylistForm("Title", [T1]).tracks).toBeUndefined();
  });
});

describe("hasFormErrors", () => {
  it("returns false for empty errors object", () => {
    expect(hasFormErrors({})).toBe(false);
  });

  it("returns true when any error key exists", () => {
    expect(hasFormErrors({ title: "required" })).toBe(true);
    expect(hasFormErrors({ tracks: "need track" })).toBe(true);
    expect(hasFormErrors({ title: "x", tracks: "y" })).toBe(true);
  });
});

// ── usePlaylistFormState ──────────────────────────────────────────────────────

describe("usePlaylistFormState — initial state", () => {
  it("initialises title as empty string", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.title).toBe("");
  });

  it("initialises tracks as empty array", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.tracks).toEqual([]);
  });

  it("initialises isPublic as true", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.isPublic).toBe(true);
  });

  it("initialises genre and mood as empty string", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.genre).toBe("");
    expect(result.current.mood).toBe("");
  });

  it("initialises isDirty as false", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.isDirty).toBe(false);
  });

  it("initialises totalDuration as 0", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.totalDuration).toBe(0);
  });

  it("initialises addedTrackIds as empty Set", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.addedTrackIds.size).toBe(0);
  });

  it("initialises removedTrack as null", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.removedTrack).toBeNull();
  });
});

describe("usePlaylistFormState — field handlers", () => {
  it("handleTitleChange updates title and marks dirty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleTitleChange("My Playlist"));
    expect(result.current.title).toBe("My Playlist");
    expect(result.current.isDirty).toBe(true);
  });

  it("handleDescriptionChange updates description and marks dirty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleDescriptionChange("Great tracks"));
    expect(result.current.description).toBe("Great tracks");
    expect(result.current.isDirty).toBe(true);
  });

  it("handleTogglePublic flips isPublic and marks dirty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleTogglePublic());
    expect(result.current.isPublic).toBe(false);
    expect(result.current.isDirty).toBe(true);
    act(() => result.current.handleTogglePublic());
    expect(result.current.isPublic).toBe(true);
  });

  it("handleCoverArtChange updates coverArt and marks dirty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleCoverArtChange("https://example.com/img.jpg"));
    expect(result.current.coverArt).toBe("https://example.com/img.jpg");
    expect(result.current.isDirty).toBe(true);
  });

  it("handleGenreChange updates genre and marks dirty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleGenreChange("Rock"));
    expect(result.current.genre).toBe("Rock");
    expect(result.current.isDirty).toBe(true);
  });

  it("handleMoodChange updates mood and marks dirty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleMoodChange("Party"));
    expect(result.current.mood).toBe("Party");
    expect(result.current.isDirty).toBe(true);
  });

  it("genre and mood are fully independent — changing one does not affect the other", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleGenreChange("Jazz"));
    act(() => result.current.handleMoodChange("Chill"));
    expect(result.current.genre).toBe("Jazz");
    expect(result.current.mood).toBe("Chill");
  });
});

describe("usePlaylistFormState — track operations", () => {
  it("handleAddTrack appends a track", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleAddTrack(T1));
    expect(result.current.tracks).toHaveLength(1);
    expect(result.current.tracks[0].id).toBe("t1");
  });

  it("handleAddTrack updates addedTrackIds", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleAddTrack(T1));
    expect(result.current.addedTrackIds.has("t1")).toBe(true);
  });

  it("handleAddTrack clears tracks validation error", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.setValidationErrors({ tracks: "Add at least 1 track." }));
    act(() => result.current.handleAddTrack(T1));
    expect(result.current.validationErrors.tracks).toBeUndefined();
  });

  it("handleRemoveTrack removes a track", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleAddTrack(T1));
    act(() => result.current.handleAddTrack(T2));
    act(() => result.current.handleRemoveTrack("t1"));
    expect(result.current.tracks).toHaveLength(1);
    expect(result.current.tracks[0].id).toBe("t2");
  });

  it("handleReorderTracks moves tracks to new positions", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => { result.current.handleAddTrack(T1); result.current.handleAddTrack(T2); result.current.handleAddTrack(T3); });
    act(() => result.current.handleReorderTracks(0, 2));
    expect(result.current.tracks[0].id).toBe("t2");
    expect(result.current.tracks[2].id).toBe("t1");
  });
});

describe("usePlaylistFormState — totalDuration", () => {
  it("sums durations of all tracks", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => { result.current.handleAddTrack(T1); result.current.handleAddTrack(T2); });
    // T1=120, T2=180 → 300
    expect(result.current.totalDuration).toBe(300);
  });

  it("is 0 when track list is empty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.totalDuration).toBe(0);
  });

  it("updates when tracks are added and removed", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleAddTrack(T1));
    expect(result.current.totalDuration).toBe(120);
    act(() => result.current.handleRemoveTrack("t1"));
    expect(result.current.totalDuration).toBe(0);
  });
});

describe("usePlaylistFormState — undo-remove", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("sets removedTrack immediately after handleRemoveTrack", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleAddTrack(T1));
    act(() => result.current.handleRemoveTrack("t1"));
    expect(result.current.removedTrack).not.toBeNull();
    expect(result.current.removedTrack?.track.id).toBe("t1");
  });

  it("removedTrack stores the original index", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => { result.current.handleAddTrack(T1); result.current.handleAddTrack(T2); result.current.handleAddTrack(T3); });
    act(() => result.current.handleRemoveTrack("t2")); // was at index 1
    expect(result.current.removedTrack?.index).toBe(1);
  });

  it("handleUndoRemove restores track to original position", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => { result.current.handleAddTrack(T1); result.current.handleAddTrack(T2); result.current.handleAddTrack(T3); });
    act(() => result.current.handleRemoveTrack("t2"));
    act(() => result.current.handleUndoRemove());
    expect(result.current.tracks[1].id).toBe("t2");
    expect(result.current.tracks).toHaveLength(3);
  });

  it("clears removedTrack after handleUndoRemove", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleAddTrack(T1));
    act(() => result.current.handleRemoveTrack("t1"));
    act(() => result.current.handleUndoRemove());
    expect(result.current.removedTrack).toBeNull();
  });

  it("removedTrack expires after 5 seconds", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleAddTrack(T1));
    act(() => result.current.handleRemoveTrack("t1"));
    expect(result.current.removedTrack).not.toBeNull();
    act(() => jest.advanceTimersByTime(5000));
    expect(result.current.removedTrack).toBeNull();
  });

  it("only last removal is undoable (rapid deletions)", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => { result.current.handleAddTrack(T1); result.current.handleAddTrack(T2); });
    act(() => result.current.handleRemoveTrack("t1"));
    act(() => result.current.handleRemoveTrack("t2"));
    // Only T2 removal is undoable
    expect(result.current.removedTrack?.track.id).toBe("t2");
    act(() => result.current.handleUndoRemove());
    expect(result.current.tracks).toHaveLength(1);
    expect(result.current.tracks[0].id).toBe("t2");
  });

  it("handleUndoRemove is a no-op when removedTrack is null", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(() => act(() => result.current.handleUndoRemove())).not.toThrow();
  });
});

describe("usePlaylistFormState — hydration", () => {
  it("hydrateFields sets all fields at once", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.hydrateFields({
      title: "Hydrated",
      description: "desc",
      isPublic: false,
      coverArt: "/cover.jpg",
      genre: "Pop",
      mood: "Happy",
      tracks: [T1, T2],
    }));
    expect(result.current.title).toBe("Hydrated");
    expect(result.current.genre).toBe("Pop");
    expect(result.current.mood).toBe("Happy");
    expect(result.current.tracks).toHaveLength(2);
  });

  it("hydrateFields does NOT mark isDirty", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.hydrateFields({
      title: "Test", description: "", isPublic: true, coverArt: "", genre: "", mood: "", tracks: [],
    }));
    expect(result.current.isDirty).toBe(false);
  });

  it("hydrateFields handles null/undefined tracks defensively", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.hydrateFields({
      title: "Test", description: "", isPublic: true, coverArt: "",
      genre: "", mood: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tracks: null as any,
    }));
    expect(Array.isArray(result.current.tracks)).toBe(true);
  });
});

describe("usePlaylistFormState — dirty tracking", () => {
  it("hasUnsavedChanges is false initially", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("hasUnsavedChanges becomes true after any user change", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleTitleChange("x"));
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  it("resetDirty clears hasUnsavedChanges", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.handleTitleChange("x"));
    act(() => result.current.resetDirty());
    expect(result.current.hasUnsavedChanges).toBe(false);
  });
});

describe("usePlaylistFormState — validation error clearing", () => {
  it("title change clears title validation error", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.setValidationErrors({ title: "required", tracks: "add track" }));
    act(() => result.current.handleTitleChange("New Title"));
    expect(result.current.validationErrors.title).toBeUndefined();
    // tracks error untouched
    expect(result.current.validationErrors.tracks).toBe("add track");
  });

  it("addTrack clears tracks validation error but not title error", () => {
    const { result } = renderHook(() => usePlaylistFormState());
    act(() => result.current.setValidationErrors({ title: "required", tracks: "add track" }));
    act(() => result.current.handleAddTrack(T1));
    expect(result.current.validationErrors.tracks).toBeUndefined();
    expect(result.current.validationErrors.title).toBe("required");
  });
});
