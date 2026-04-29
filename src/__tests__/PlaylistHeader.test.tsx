/**
 * PlaylistHeader.test.tsx
 *
 * Tests for PlaylistHeader including Like toggle and Share fallback.
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PlaylistHeader from "@/components/playlist/PlaylistHeader";
import { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";

// ── Mock usePlayerStore ────────────────────────────────────────
const mockSetQueue = jest.fn();
const mockSetTrack = jest.fn();

jest.mock("@/store/playerStore", () => ({
  usePlayerStore: (selector: (s: object) => unknown) =>
    selector({
      currentTrack: null,
      isPlaying: false,
      setQueue: mockSetQueue,
      setTrack: mockSetTrack,
      togglePlay: jest.fn(),
    }),
}));

// ── Fixtures ───────────────────────────────────────────────────
const MOCK_PLAYLIST: IPlaylist = {
  id: "123",
  title: "Test Playlist",
  description: "A test description",
  coverArt: "/covers/song1.jpg",
  creator: "Test Creator",
  tracks: [],
};

const MOCK_TRACKS: IPlaylistTrack[] = [
  { id: "t1", title: "Track One", artist: "Artist A", albumArt: "/covers/song1.jpg", duration: 180 },
  { id: "t2", title: "Track Two", artist: "Artist B", albumArt: "/covers/song2.jpg", duration: 200 },
];

// ── Tests ──────────────────────────────────────────────────────
describe("PlaylistHeader", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders playlist title", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);
    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
  });

  it("renders creator name", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);
    expect(screen.getByText("Test Creator")).toBeInTheDocument();
  });

  it("renders track count from the tracks prop", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);
    expect(screen.getByText("2 tracks")).toBeInTheDocument();
  });

  it("renders singular 'track' when count is 1", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={[MOCK_TRACKS[0]]} />);
    expect(screen.getByText("1 track")).toBeInTheDocument();
  });

  it("calls setQueue and setTrack on Play All click", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);
    fireEvent.click(screen.getByRole("button", { name: /play all/i }));
    expect(mockSetQueue).toHaveBeenCalledTimes(1);
    expect(mockSetTrack).toHaveBeenCalledTimes(1);
  });

  it("does not call setQueue when tracks list is empty", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /play all/i }));
    expect(mockSetQueue).not.toHaveBeenCalled();
  });

  // ── Like button ────────────────────────────────────────────────
  it("renders Like button with correct initial aria-pressed=false", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);
    const btn = screen.getByRole("button", { name: /like this playlist/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles to liked state when Like is clicked", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);
    const btn = screen.getByRole("button", { name: /like this playlist/i });
    fireEvent.click(btn);
    expect(screen.getByRole("button", { name: /unlike this playlist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /unlike this playlist/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles back to unliked when clicked twice", () => {
    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);
    const btn = screen.getByRole("button", { name: /like this playlist/i });
    fireEvent.click(btn);
    fireEvent.click(screen.getByRole("button", { name: /unlike this playlist/i }));
    expect(screen.getByRole("button", { name: /like this playlist/i })).toHaveAttribute("aria-pressed", "false");
  });

  // ── Share button — clipboard fallback ──────────────────────────
  it("shows 'Link copied to clipboard' after Share click (clipboard fallback)", async () => {
    // navigator.share not supported in jsdom — clipboard fallback fires
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /share this playlist/i }));
    });

    await waitFor(() =>
      expect(screen.getByText("Link copied to clipboard")).toBeInTheDocument()
    );
  });

  it("shows 'Failed to copy link' when clipboard throws", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });

    render(<PlaylistHeader playlist={MOCK_PLAYLIST} tracks={MOCK_TRACKS} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /share this playlist/i }));
    });

    await waitFor(() =>
      expect(screen.getByText("Failed to copy link")).toBeInTheDocument()
    );
  });
});
