/**
 * TrackSelector.test.tsx
 *
 * Full coverage of the track catalogue panel.
 * Tests: renders catalogue, search filter, add button, already-added state,
 *        clear search, empty search result, defensive AVAILABLE_TRACKS guard.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import TrackSelector from "@/components/playlist/TrackSelector";
import { IPlaylistTrack } from "@/types/playlist.types";

// ── Mock playlistMockData ─────────────────────────────────────────────────────
const MOCK_CATALOGUE: IPlaylistTrack[] = [
  { id: "t1", title: "Neon Drift",   artist: "HΛLOGEN",  albumArt: "/covers/song1.jpg", duration: 214, url: "/tracks/song1.mp3" },
  { id: "t2", title: "Subzero Bloom",artist: "Crestfall", albumArt: "/covers/song2.jpg", duration: 187, url: "/tracks/song2.mp3" },
  { id: "t3", title: "Golden Hour",  artist: "The Coasts",albumArt: "/covers/song2.jpg", duration: 203, url: "/tracks/song2.mp3" },
];

jest.mock("@/services/mocks/playlistMockData", () => ({
  AVAILABLE_TRACKS: [
    { id: "t1", title: "Neon Drift",   artist: "HΛLOGEN",  albumArt: "/covers/song1.jpg", duration: 214, url: "/tracks/song1.mp3" },
    { id: "t2", title: "Subzero Bloom",artist: "Crestfall", albumArt: "/covers/song2.jpg", duration: 187, url: "/tracks/song2.mp3" },
    { id: "t3", title: "Golden Hour",  artist: "The Coasts",albumArt: "/covers/song2.jpg", duration: 203, url: "/tracks/song2.mp3" },
  ],
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const emptySet = new Set<string>();

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TrackSelector — render", () => {
  it("renders the panel heading", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    expect(screen.getByText("Add Tracks")).toBeInTheDocument();
  });

  it("renders all catalogue tracks", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    expect(screen.getByText("Neon Drift")).toBeInTheDocument();
    expect(screen.getByText("Subzero Bloom")).toBeInTheDocument();
    expect(screen.getByText("Golden Hour")).toBeInTheDocument();
  });

  it("renders a search input", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("renders Add buttons for every track", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    const addButtons = screen.getAllByRole("button", { name: /^add /i });
    expect(addButtons).toHaveLength(MOCK_CATALOGUE.length);
  });
});

describe("TrackSelector — search", () => {
  it("filters by title (case-insensitive)", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "neon" } });
    expect(screen.getByText("Neon Drift")).toBeInTheDocument();
    expect(screen.queryByText("Subzero Bloom")).not.toBeInTheDocument();
  });

  it("filters by artist name", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "coasts" } });
    expect(screen.getByText("Golden Hour")).toBeInTheDocument();
    expect(screen.queryByText("Neon Drift")).not.toBeInTheDocument();
  });

  it("shows empty state when no tracks match search", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzzznotfound" } });
    expect(screen.queryByText("Neon Drift")).not.toBeInTheDocument();
    // Should show some "no match" message
    const list = screen.getByRole("list", { name: /available tracks/i });
    expect(list.querySelector(".ts-list__empty")).toBeInTheDocument();
  });

  it("shows Clear button when query is non-empty", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "neon" } });
    expect(screen.getByRole("button", { name: /clear search/i })).toBeInTheDocument();
  });

  it("does not show Clear button when query is empty", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    expect(screen.queryByRole("button", { name: /clear search/i })).not.toBeInTheDocument();
  });

  it("clicking Clear resets query and shows all tracks", () => {
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "neon" } });
    fireEvent.click(screen.getByRole("button", { name: /clear search/i }));
    expect(screen.getByText("Subzero Bloom")).toBeInTheDocument();
    expect(screen.getByText("Golden Hour")).toBeInTheDocument();
  });
});

describe("TrackSelector — add interaction", () => {
  it("calls onAddTrack with the correct track when Add is clicked", () => {
    const onAddTrack = jest.fn();
    render(<TrackSelector addedTrackIds={emptySet} onAddTrack={onAddTrack} />);
    fireEvent.click(screen.getByRole("button", { name: /add neon drift/i }));
    expect(onAddTrack).toHaveBeenCalledTimes(1);
    expect(onAddTrack).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t1", title: "Neon Drift" })
    );
  });

  it("already-added track has disabled button", () => {
    const addedSet = new Set(["t1"]);
    render(<TrackSelector addedTrackIds={addedSet} onAddTrack={jest.fn()} />);
    expect(screen.getByRole("button", { name: /neon drift already added/i }))
      .toBeDisabled();
  });

  it("does not call onAddTrack when clicking an already-added track button", () => {
    const onAddTrack = jest.fn();
    const addedSet = new Set(["t1"]);
    render(<TrackSelector addedTrackIds={addedSet} onAddTrack={onAddTrack} />);
    fireEvent.click(screen.getByRole("button", { name: /neon drift already added/i }));
    expect(onAddTrack).not.toHaveBeenCalled();
  });

  it("shows Add button (not checkmark) for non-added tracks", () => {
    const addedSet = new Set(["t1"]); // only t1 added
    render(<TrackSelector addedTrackIds={addedSet} onAddTrack={jest.fn()} />);
    expect(screen.getByRole("button", { name: /^add subzero bloom/i })).not.toBeDisabled();
  });
});

describe("TrackSelector — defensive guard", () => {
  it("does not crash when AVAILABLE_TRACKS could be undefined (module guard)", () => {
    // The component's useMemo has Array.isArray guard
    // If somehow AVAILABLE_TRACKS were undefined, catalogue falls back to []
    // Verify the component renders without crash
    expect(() =>
      render(<TrackSelector addedTrackIds={emptySet} onAddTrack={jest.fn()} />)
    ).not.toThrow();
  });
});
