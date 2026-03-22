/**
 * usePlaylist.test.ts
 *
 * Tests for the usePlaylist custom hook.
 * Covers: skeleton loading state, successful fetch, error state,
 *         not-found state, retry mechanism, and track array management.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { usePlaylist } from "@/hooks/usePlaylist";
import { IPlaylist } from "@/types/playlist.types";

// ── Mock @/services barrel ─────────────────────────────────────
const mockGetById = jest.fn();

jest.mock("@/services", () => ({
  playlistService: {
    getById: (...args: unknown[]) => mockGetById(...args),
  },
}));

// ── Mock track helpers ─────────────────────────────────────────
jest.mock("@/services/mocks/playlistMockData", () => ({
  addTrackToList: jest.fn((tracks: unknown[], track: unknown) => {
    const arr = tracks as Array<{ id: string }>;
    const t = track as { id: string };
    if (arr.some((x) => x.id === t.id)) return arr;
    return [...arr, t];
  }),
  removeTrackFromList: jest.fn((tracks: unknown[], id: string) =>
    (tracks as Array<{ id: string }>).filter((t) => t.id !== id)
  ),
  reorderTracks: jest.fn((tracks: unknown[], from: number, to: number) => {
    const arr = [...(tracks as unknown[])];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    return arr;
  }),
}));

// ── Fixture ────────────────────────────────────────────────────
const MOCK_PLAYLIST: IPlaylist = {
  id: "123",
  title: "Midnight Frequencies",
  description: "desc",
  coverArt: "/covers/song1.jpg",
  creator: "Aurora Vex",
  tracks: [
    { id: "t1", title: "Track One", artist: "Artist A", albumArt: "/covers/song1.jpg", duration: 180 },
    { id: "t2", title: "Track Two", artist: "Artist B", albumArt: "/covers/song2.jpg", duration: 200 },
  ],
};

// ── Tests ──────────────────────────────────────────────────────
describe("usePlaylist", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Loading state ─────────────────────────────────────────────
  it("starts in loading state (isLoading=true) immediately on mount", () => {
    mockGetById.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => usePlaylist("123"));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.playlist).toBeNull();
    expect(result.current.hasError).toBe(false);
  });

  // ── Successful fetch ──────────────────────────────────────────
  it("loads playlist successfully and clears loading", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    const { result } = renderHook(() => usePlaylist("123"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.playlist).toEqual(MOCK_PLAYLIST);
    expect(result.current.hasError).toBe(false);
    expect(result.current.tracks).toHaveLength(2);
  });

  it("populates tracks from fetched playlist", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    const { result } = renderHook(() => usePlaylist("123"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.tracks[0].id).toBe("t1");
    expect(result.current.tracks[1].id).toBe("t2");
  });

  // ── Not found ─────────────────────────────────────────────────
  it("sets hasError when service returns null (not found)", async () => {
    mockGetById.mockResolvedValue(null);
    const { result } = renderHook(() => usePlaylist("9999"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasError).toBe(true);
    expect(result.current.errorMessage).toBe("Playlist not found.");
    expect(result.current.playlist).toBeNull();
  });

  // ── Network error ─────────────────────────────────────────────
  it("sets hasError when service throws", async () => {
    mockGetById.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => usePlaylist("123"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasError).toBe(true);
    expect(result.current.errorMessage).toContain("Failed to load");
  });

  // ── Empty id guard ────────────────────────────────────────────
  it("does not fetch when id is empty string", () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    renderHook(() => usePlaylist(""));
    expect(mockGetById).not.toHaveBeenCalled();
  });

  // ── Retry ─────────────────────────────────────────────────────
  it("retryCount starts at 0 and canRetry is true", async () => {
    mockGetById.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.retryCount).toBe(0);
    expect(result.current.canRetry).toBe(true);
  });

  it("increments retryCount and re-fetches on handleRetry", async () => {
    mockGetById.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.handleRetry(); });
    await waitFor(() => expect(result.current.retryCount).toBe(1));

    expect(mockGetById).toHaveBeenCalledTimes(2);
  });

  it("canRetry becomes false after 3 retries", async () => {
    mockGetById.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    for (let i = 0; i < 3; i++) {
      act(() => { result.current.handleRetry(); });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    }

    expect(result.current.retryCount).toBe(3);
    expect(result.current.canRetry).toBe(false);
  });

  it("handleRetry does nothing when canRetry is false", async () => {
    mockGetById.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    for (let i = 0; i < 3; i++) {
      act(() => { result.current.handleRetry(); });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    }

    const callsBefore = mockGetById.mock.calls.length;
    act(() => { result.current.handleRetry(); });
    expect(mockGetById.mock.calls.length).toBe(callsBefore);
  });

  // ── Track array management ─────────────────────────────────────
  it("handleAddTrack appends a new track", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newTrack = { id: "t3", title: "New", artist: "X", albumArt: "/covers/song1.jpg", duration: 120 };
    act(() => { result.current.handleAddTrack(newTrack); });

    expect(result.current.tracks).toHaveLength(3);
    expect(result.current.tracks[2].id).toBe("t3");
  });

  it("handleAddTrack does not add a duplicate", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.handleAddTrack(MOCK_PLAYLIST.tracks[0]); });
    expect(result.current.tracks).toHaveLength(2);
  });

  it("handleRemoveTrack removes a track by id", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.handleRemoveTrack("t1"); });

    expect(result.current.tracks).toHaveLength(1);
    expect(result.current.tracks[0].id).toBe("t2");
  });

  it("handleReorderTracks moves a track to new position", async () => {
    mockGetById.mockResolvedValue(MOCK_PLAYLIST);
    const { result } = renderHook(() => usePlaylist("123"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.handleReorderTracks(0, 1); });

    expect(result.current.tracks[0].id).toBe("t2");
    expect(result.current.tracks[1].id).toBe("t1");
  });
});
