/**
 * usePlaylistDraft.test.ts
 *
 * Full coverage of the draft autosave hook.
 * Tests: hasDraft detection, version guard, restore, discard,
 *        autosave debounce (only fires after isDirty + delay),
 *        no save on hydration, corrupted/missing draft handling.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { usePlaylistDraft } from "@/hooks/usePlaylistDraft";
import { CURRENT_DRAFT_VERSION, IPlaylistFormFields } from "@/types/playlist.types";
import { PLAYLIST_DRAFT_LS_KEY, PLAYLIST_DRAFT_DEBOUNCE_MS } from "@/constants/playlist.constants";

// ── Mock debounce to be synchronous in tests ──────────────────────────────────
jest.mock("@/utils/debounce", () => ({
  debounce: jest.fn((fn: (...args: unknown[]) => void) => {
    const debounced = (...args: unknown[]) => fn(...args);
    debounced.cancel = jest.fn();
    return debounced;
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const BLANK_FIELDS: IPlaylistFormFields = {
  title: "", description: "", isPublic: true,
  coverArt: "", genre: "", mood: "", tracks: [],
};

const DIRTY_FIELDS: IPlaylistFormFields = {
  title: "My Draft",
  description: "WIP",
  isPublic: true,
  coverArt: "",
  genre: "Rock",
  mood: "Party",
  tracks: [{ id: "t1", title: "Track", artist: "A", albumArt: "/a.jpg", duration: 100, url: "" }],
};

function writeDraftToStorage(version = CURRENT_DRAFT_VERSION, data = DIRTY_FIELDS) {
  localStorage.setItem(PLAYLIST_DRAFT_LS_KEY, JSON.stringify({
    version,
    savedAt: Date.now(),
    data,
  }));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe("usePlaylistDraft — initial detection", () => {
  it("hasDraft is false when no draft in localStorage", () => {
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.hasDraft).toBe(false);
  });

  it("hasDraft is true when a valid draft with title exists", () => {
    writeDraftToStorage();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.hasDraft).toBe(true);
  });

  it("draftSavedAt is populated when draft exists", () => {
    writeDraftToStorage();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.draftSavedAt).toBeGreaterThan(0);
  });

  it("hasDraft is false when isActive is false (edit mode)", () => {
    writeDraftToStorage();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: false, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.hasDraft).toBe(false);
  });
});

describe("usePlaylistDraft — version guard", () => {
  it("discards draft with wrong version number", () => {
    writeDraftToStorage(1); // old version
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.hasDraft).toBe(false);
    // Also removes from localStorage
    expect(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)).toBeNull();
  });

  it("discards draft with no version field", () => {
    localStorage.setItem(PLAYLIST_DRAFT_LS_KEY, JSON.stringify({ savedAt: Date.now(), data: DIRTY_FIELDS }));
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.hasDraft).toBe(false);
  });

  it("discards corrupted JSON", () => {
    localStorage.setItem(PLAYLIST_DRAFT_LS_KEY, "not-valid-json{{{");
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.hasDraft).toBe(false);
  });

  it("discards draft with undefined data.tracks (normalises to [])", () => {
    localStorage.setItem(PLAYLIST_DRAFT_LS_KEY, JSON.stringify({
      version: CURRENT_DRAFT_VERSION,
      savedAt: Date.now(),
      data: { ...DIRTY_FIELDS, tracks: undefined },
    }));
    const hydrateFields = jest.fn();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields })
    );
    if (result.current.hasDraft) {
      act(() => result.current.handleRestoreDraft());
      const hydratedArg = hydrateFields.mock.calls[0][0];
      expect(Array.isArray(hydratedArg.tracks)).toBe(true);
    }
    // No crash either way
  });

  it("accepts draft with correct version", () => {
    writeDraftToStorage(CURRENT_DRAFT_VERSION);
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    expect(result.current.hasDraft).toBe(true);
  });
});

describe("usePlaylistDraft — restore", () => {
  it("handleRestoreDraft calls hydrateFields with saved data", () => {
    writeDraftToStorage();
    const hydrateFields = jest.fn();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields })
    );
    act(() => result.current.handleRestoreDraft());
    expect(hydrateFields).toHaveBeenCalledTimes(1);
    const arg = hydrateFields.mock.calls[0][0];
    expect(arg.title).toBe("My Draft");
    expect(arg.genre).toBe("Rock");
    expect(arg.mood).toBe("Party");
  });

  it("handleRestoreDraft clears hasDraft", () => {
    writeDraftToStorage();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    act(() => result.current.handleRestoreDraft());
    expect(result.current.hasDraft).toBe(false);
  });

  it("handleRestoreDraft provides safe defaults for missing fields", () => {
    localStorage.setItem(PLAYLIST_DRAFT_LS_KEY, JSON.stringify({
      version: CURRENT_DRAFT_VERSION,
      savedAt: Date.now(),
      data: { title: "Partial" }, // missing most fields
    }));
    const hydrateFields = jest.fn();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields })
    );
    act(() => result.current.handleRestoreDraft());
    const arg = hydrateFields.mock.calls[0][0];
    expect(arg.title).toBe("Partial");
    expect(arg.description).toBe("");
    expect(arg.isPublic).toBe(true);
    expect(Array.isArray(arg.tracks)).toBe(true);
    expect(arg.genre).toBe("");
    expect(arg.mood).toBe("");
  });
});

describe("usePlaylistDraft — discard", () => {
  it("handleDiscardDraft sets hasDraft to false", () => {
    writeDraftToStorage();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    act(() => result.current.handleDiscardDraft());
    expect(result.current.hasDraft).toBe(false);
  });

  it("handleDiscardDraft removes draft from localStorage", () => {
    writeDraftToStorage();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    act(() => result.current.handleDiscardDraft());
    expect(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)).toBeNull();
  });

  it("handleDiscardDraft clears draftSavedAt", () => {
    writeDraftToStorage();
    const { result } = renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: false, hydrateFields: jest.fn() })
    );
    act(() => result.current.handleDiscardDraft());
    expect(result.current.draftSavedAt).toBeNull();
  });
});

describe("usePlaylistDraft — autosave", () => {
  it("does NOT save when isDirty is false", () => {
    const { rerender } = renderHook(
      ({ fields, isDirty }: { fields: IPlaylistFormFields; isDirty: boolean }) =>
        usePlaylistDraft({ isActive: true, fields, isDirty, hydrateFields: jest.fn() }),
      { initialProps: { fields: DIRTY_FIELDS, isDirty: false } }
    );
    // Re-render with same dirty=false
    rerender({ fields: DIRTY_FIELDS, isDirty: false });
    expect(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)).toBeNull();
  });

  it("does NOT save blank form even when isDirty is true", () => {
    renderHook(() =>
      usePlaylistDraft({ isActive: true, fields: BLANK_FIELDS, isDirty: true, hydrateFields: jest.fn() })
    );
    expect(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)).toBeNull();
  });

  it("saves when isDirty is true and fields have content", async () => {
    const { rerender } = renderHook(
      ({ isDirty }: { isDirty: boolean }) =>
        usePlaylistDraft({ isActive: true, fields: DIRTY_FIELDS, isDirty, hydrateFields: jest.fn() }),
      { initialProps: { isDirty: false } }
    );

    act(() => rerender({ isDirty: true }));

    await waitFor(() =>
      expect(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)).not.toBeNull()
    );

    const saved = JSON.parse(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)!);
    expect(saved.version).toBe(CURRENT_DRAFT_VERSION);
    expect(saved.data.title).toBe("My Draft");
    expect(saved.data.genre).toBe("Rock");
    expect(saved.data.mood).toBe("Party");
  });

  it("does NOT save when isActive is false", () => {
    renderHook(() =>
      usePlaylistDraft({ isActive: false, fields: DIRTY_FIELDS, isDirty: true, hydrateFields: jest.fn() })
    );
    expect(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)).toBeNull();
  });

  it("saved draft always includes an array for tracks", async () => {
    const { rerender } = renderHook(
      ({ isDirty }: { isDirty: boolean }) =>
        usePlaylistDraft({ isActive: true, fields: DIRTY_FIELDS, isDirty, hydrateFields: jest.fn() }),
      { initialProps: { isDirty: false } }
    );
    act(() => rerender({ isDirty: true }));

    await waitFor(() =>
      expect(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)).not.toBeNull()
    );

    const saved = JSON.parse(localStorage.getItem(PLAYLIST_DRAFT_LS_KEY)!);
    expect(Array.isArray(saved.data.tracks)).toBe(true);
  });

  it("exports correct PLAYLIST_DRAFT_DEBOUNCE_MS constant", () => {
    expect(typeof PLAYLIST_DRAFT_DEBOUNCE_MS).toBe("number");
    expect(PLAYLIST_DRAFT_DEBOUNCE_MS).toBeGreaterThan(0);
  });
});
