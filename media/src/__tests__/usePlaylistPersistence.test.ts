/**
 * usePlaylistPersistence.test.ts
 *
 * Full coverage of the API round-trip hook.
 * Tests: initial status (idle vs loading), successful load, load error,
 *        create submit, update submit, validation block, double-submit guard,
 *        onSuccess callback, PersistenceStatus transitions.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { usePlaylistPersistence } from "@/hooks/usePlaylistPersistence";
import { IPlaylist, IPlaylistFormFields } from "@/types/playlist.types";

// ── Mock @/services ───────────────────────────────────────────────────────────
const mockGetById = jest.fn();
const mockCreate  = jest.fn();
const mockUpdate  = jest.fn();

jest.mock("@/services", () => ({
  playlistService: {
    getById: (...args: unknown[]) => mockGetById(...args),
    create:  (...args: unknown[]) => mockCreate(...args),
    update:  (...args: unknown[]) => mockUpdate(...args),
  },
}));

// ── Mock validation (imported from usePlaylistFormState) ──────────────────────
jest.mock("@/hooks/usePlaylistFormState", () => ({
  validatePlaylistForm: jest.fn(
    (title: string, tracks: unknown[]) => {
      const errors: Record<string, string> = {};
      if (!title.trim()) errors.title = "required";
      if (!Array.isArray(tracks) || tracks.length === 0) errors.tracks = "add track";
      return errors;
    }
  ),
  hasFormErrors: jest.fn((errors: Record<string, string>) => Object.keys(errors).length > 0),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_PLAYLIST: IPlaylist = {
  id: "123",
  title: "Test Playlist",
  description: "desc",
  coverArt: "/covers/song1.jpg",
  creator: "You",
  isPublic: true,
  tracks: [
    { id: "t1", title: "Track", artist: "Artist", albumArt: "/a.jpg", duration: 180, url: "/tracks/song1.mp3" },
  ],
};

const VALID_FORM_STATE: IPlaylistFormFields & {
  setValidationErrors: jest.Mock;
  hydrateFields: jest.Mock;
  resetDirty: jest.Mock;
} = {
  title: "My Playlist",
  description: "desc",
  isPublic: true,
  coverArt: "/covers/song1.jpg",
  genre: "",
  mood: "",
  tracks: [{ id: "t1", title: "T", artist: "A", albumArt: "/a.jpg", duration: 100, url: "" }],
  setValidationErrors: jest.fn(),
  hydrateFields: jest.fn(),
  resetDirty: jest.fn(),
};

function makeFormState(overrides: Partial<typeof VALID_FORM_STATE> = {}) {
  return {
    ...VALID_FORM_STATE,
    setValidationErrors: jest.fn(),
    hydrateFields: jest.fn(),
    resetDirty: jest.fn(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("usePlaylistPersistence — create mode", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts with status idle in create mode", () => {
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "create", formState: makeFormState() })
    );
    expect(result.current.status.kind).toBe("idle");
  });

  it("transitions to submitting then success on create", async () => {
    mockCreate.mockResolvedValue({ ...MOCK_PLAYLIST, id: "mock-1001" });
    const formState = makeFormState();
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "create", formState, onSuccess })
    );

    let returnedId: string | null = null;
    await act(async () => {
      returnedId = await result.current.submit();
    });

    // waitFor ensures all post-async state updates (setStatus "success") have
    // settled before asserting — prevents the act() warning from React.
    await waitFor(() => {
      expect(result.current.status.kind).toBe("success");
    });
    expect(returnedId).toBe("mock-1001");
    expect(formState.resetDirty).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("transitions to error status when create throws", async () => {
    mockCreate.mockRejectedValue(new Error("Server error"));
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "create", formState: makeFormState() })
    );

    await act(async () => { await result.current.submit(); });

    expect(result.current.status.kind).toBe("error");
    if (result.current.status.kind === "error") {
      expect(result.current.status.message).toContain("Server error");
    }
  });

  it("returns null and sets validation errors when title is empty", async () => {
    const formState = makeFormState({ title: "" });
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "create", formState })
    );

    const returnedId = await act(async () => result.current.submit());
    expect(returnedId).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(formState.setValidationErrors).toHaveBeenCalledTimes(1);
  });

  it("returns null and sets validation errors when tracks is empty", async () => {
    const formState = makeFormState({ tracks: [] });
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "create", formState })
    );

    const returnedId = await act(async () => result.current.submit());
    expect(returnedId).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("guards against double-submission", async () => {
    let resolveCreate: (val: IPlaylist) => void;
    mockCreate.mockReturnValue(new Promise((r) => { resolveCreate = r; }));
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "create", formState: makeFormState() })
    );

    act(() => { void result.current.submit(); });
    // Second call while submitting
    const secondResult = await act(async () => result.current.submit());

    expect(secondResult).toBeNull();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    resolveCreate!({ ...MOCK_PLAYLIST, id: "x" });
  });
});

describe("usePlaylistPersistence — edit mode", () => {
  beforeEach(() => jest.clearAllMocks());

  it("starts with status loading when playlistId is provided", () => {
    mockGetById.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "edit", playlistId: "123", formState: makeFormState() })
    );
    expect(result.current.status.kind).toBe("loading");
  });

  it("starts idle when playlistId is empty string", () => {
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "edit", playlistId: "", formState: makeFormState() })
    );
    expect(result.current.status.kind).toBe("idle");
  });

  it("hydrates form and transitions to idle after successful load", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    const formState = makeFormState();
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "edit", playlistId: "123", formState })
    );

    await waitFor(() => expect(result.current.status.kind).toBe("idle"));
    expect(formState.hydrateFields).toHaveBeenCalledTimes(1);
    const hydratedArg = formState.hydrateFields.mock.calls[0][0];
    expect(hydratedArg.title).toBe("Test Playlist");
  });

  it("transitions to error when playlist not found (null)", async () => {
    mockGetById.mockResolvedValue(null);
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "edit", playlistId: "9999", formState: makeFormState() })
    );

    await waitFor(() => expect(result.current.status.kind).toBe("error"));
    if (result.current.status.kind === "error") {
      expect(result.current.status.message).toMatch(/not found/i);
    }
  });

  it("transitions to error when getById throws", async () => {
    mockGetById.mockRejectedValue(new Error("Network failure"));
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "edit", playlistId: "123", formState: makeFormState() })
    );

    await waitFor(() => expect(result.current.status.kind).toBe("error"));
  });

  it("submit calls update (not create) in edit mode", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    mockUpdate.mockResolvedValue({ ...MOCK_PLAYLIST, title: "Updated" });
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "edit", playlistId: "123", formState: makeFormState() })
    );

    await waitFor(() => expect(result.current.status.kind).toBe("idle"));
    await act(async () => { await result.current.submit(); });
    await waitFor(() => expect(result.current.status.kind).not.toBe("submitting"));

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("passes genre and mood through to update payload", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    mockUpdate.mockResolvedValue(MOCK_PLAYLIST);
    const formState = makeFormState({ genre: "Rock", mood: "Party" });
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "edit", playlistId: "123", formState })
    );

    await waitFor(() => expect(result.current.status.kind).toBe("idle"));
    await act(async () => { await result.current.submit(); });

    const payload = mockUpdate.mock.calls[0][0];
    expect(payload.genre).toBe("Rock");
    expect(payload.mood).toBe("Party");
  });
});

describe("usePlaylistPersistence — success payload", () => {
  beforeEach(() => jest.clearAllMocks());

  it("success status carries the created playlist id", async () => {
    mockCreate.mockResolvedValue({ ...MOCK_PLAYLIST, id: "mock-2000" });
    const { result } = renderHook(() =>
      usePlaylistPersistence({ mode: "create", formState: makeFormState() })
    );

    await act(async () => { await result.current.submit(); });

    await waitFor(() => {
      expect(result.current.status.kind).toBe("success");
    });
    if (result.current.status.kind === "success") {
      expect(result.current.status.id).toBe("mock-2000");
    }
  });
});
