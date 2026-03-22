/**
 * PlaylistHeader.test.tsx
 *
 * Full coverage including Tier 1 additions:
 *  - Genre and mood tag pills (independent display, correct CSS classes)
 *  - isPublic visibility badge
 *  - canEdit toggle for Edit button
 *  - Like toggle, Share fallback, Play All with queue
 */

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import PlaylistHeader from "@/components/playlist/PlaylistHeader";
import { IPlaylist, IPlaylistTrack } from "@/types/playlist.types";

// ── Mock usePlayerStore ────────────────────────────────────────────────────────
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

jest.mock("@/utils/resolveTrackUrl", () => ({
  resolveTrackUrl: (url: string) => url || "/tracks/song1.mp3",
}));

// ── Fixtures ───────────────────────────────────────────────────────────────────
const BASE_PLAYLIST: IPlaylist = {
  id: "123",
  title: "Test Playlist",
  description: "A test description",
  coverArt: "/covers/song1.jpg",
  creator: "Test Creator",
  isPublic: true,
  tracks: [],
};

const TRACKS: IPlaylistTrack[] = [
  { id: "t1", title: "Track One", artist: "Artist A", albumArt: "/covers/song1.jpg", duration: 180, url: "/tracks/song1.mp3" },
  { id: "t2", title: "Track Two", artist: "Artist B", albumArt: "/covers/song2.jpg", duration: 200, url: "/tracks/song2.mp3" },
];

// ── Core render ────────────────────────────────────────────────────────────────

describe("PlaylistHeader — core render", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the playlist title", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    expect(screen.getByText("Test Playlist")).toBeInTheDocument();
  });

  it("renders the creator name", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    expect(screen.getByText("Test Creator")).toBeInTheDocument();
  });

  it("renders track count (plural)", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    expect(screen.getByText("2 tracks")).toBeInTheDocument();
  });

  it("renders singular 'track' when count is 1", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={[TRACKS[0]]} />);
    expect(screen.getByText("1 track")).toBeInTheDocument();
  });

  it("renders the description when present", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    expect(screen.getByText("A test description")).toBeInTheDocument();
  });

  it("does not render description when absent", () => {
    const noDesc = { ...BASE_PLAYLIST, description: "" };
    render(<PlaylistHeader playlist={noDesc} tracks={TRACKS} />);
    expect(screen.queryByText("A test description")).not.toBeInTheDocument();
  });
});

// ── Play All ───────────────────────────────────────────────────────────────────

describe("PlaylistHeader — Play All", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls setQueue and setTrack when Play All clicked", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    fireEvent.click(screen.getByRole("button", { name: /play all/i }));
    expect(mockSetQueue).toHaveBeenCalledTimes(1);
    expect(mockSetTrack).toHaveBeenCalledTimes(1);
  });

  it("does not call setQueue when track list is empty", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /play all/i }));
    expect(mockSetQueue).not.toHaveBeenCalled();
  });

  it("Play All button is disabled when tracks is empty", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={[]} />);
    expect(screen.getByRole("button", { name: /play all/i })).toBeDisabled();
  });
});

// ── Like button ────────────────────────────────────────────────────────────────

describe("PlaylistHeader — Like", () => {
  it("initial aria-pressed is false", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    expect(screen.getByRole("button", { name: /like this playlist/i }))
      .toHaveAttribute("aria-pressed", "false");
  });

  it("toggles to liked state on click", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    fireEvent.click(screen.getByRole("button", { name: /like this playlist/i }));
    expect(screen.getByRole("button", { name: /unlike this playlist/i }))
      .toHaveAttribute("aria-pressed", "true");
  });

  it("toggles back to unliked on second click", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    fireEvent.click(screen.getByRole("button", { name: /like this playlist/i }));
    fireEvent.click(screen.getByRole("button", { name: /unlike this playlist/i }));
    expect(screen.getByRole("button", { name: /like this playlist/i }))
      .toHaveAttribute("aria-pressed", "false");
  });
});

// ── Share button ───────────────────────────────────────────────────────────────

describe("PlaylistHeader — Share", () => {
  it("shows 'Link copied to clipboard' after Share click (clipboard fallback)", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
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

    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /share this playlist/i }));
    });
    await waitFor(() =>
      expect(screen.getByText("Failed to copy link")).toBeInTheDocument()
    );
  });
});

// ── Edit button ────────────────────────────────────────────────────────────────

describe("PlaylistHeader — Edit button", () => {
  it("renders Edit link when canEdit is true (default)", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    expect(screen.getByRole("link", { name: /edit/i })).toBeInTheDocument();
  });

  it("Edit link href points to /playlist/:id/edit", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} />);
    expect(screen.getByRole("link", { name: /edit/i }))
      .toHaveAttribute("href", "/playlist/123/edit");
  });

  it("does not render Edit link when canEdit is false", () => {
    render(<PlaylistHeader playlist={BASE_PLAYLIST} tracks={TRACKS} canEdit={false} />);
    expect(screen.queryByRole("link", { name: /edit/i })).not.toBeInTheDocument();
  });
});

// ── Visibility badge ───────────────────────────────────────────────────────────

describe("PlaylistHeader — visibility badge", () => {
  it("shows Public badge for public playlist", () => {
    render(<PlaylistHeader playlist={{ ...BASE_PLAYLIST, isPublic: true }} tracks={TRACKS} />);
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("shows Private badge for private playlist", () => {
    render(<PlaylistHeader playlist={{ ...BASE_PLAYLIST, isPublic: false }} tracks={TRACKS} />);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });
});

// ── Genre / Mood tags ──────────────────────────────────────────────────────────

describe("PlaylistHeader — genre/mood tags", () => {
  it("renders genre pill when genre is set", () => {
    const playlist = { ...BASE_PLAYLIST, genre: "Rock" as const };
    render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    expect(screen.getByText("Rock")).toBeInTheDocument();
  });

  it("renders mood pill when mood is set", () => {
    const playlist = { ...BASE_PLAYLIST, mood: "Party" as const };
    render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    expect(screen.getByText("Party")).toBeInTheDocument();
  });

  it("renders both genre and mood pills simultaneously (not mutually exclusive)", () => {
    const playlist = { ...BASE_PLAYLIST, genre: "Rock" as const, mood: "Party" as const };
    render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    expect(screen.getByText("Rock")).toBeInTheDocument();
    expect(screen.getByText("Party")).toBeInTheDocument();
  });

  it("genre pill has playlist-header__tag--genre class", () => {
    const playlist = { ...BASE_PLAYLIST, genre: "Jazz" as const };
    const { container } = render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    const genreTag = container.querySelector(".playlist-header__tag--genre");
    expect(genreTag).toBeInTheDocument();
    expect(genreTag).toHaveTextContent("Jazz");
  });

  it("mood pill has playlist-header__tag--mood class", () => {
    const playlist = { ...BASE_PLAYLIST, mood: "Chill" as const };
    const { container } = render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    const moodTag = container.querySelector(".playlist-header__tag--mood");
    expect(moodTag).toBeInTheDocument();
    expect(moodTag).toHaveTextContent("Chill");
  });

  it("does not render tag container when neither genre nor mood is set", () => {
    const playlist = { ...BASE_PLAYLIST };
    const { container } = render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    expect(container.querySelector(".playlist-header__tags")).not.toBeInTheDocument();
  });

  it("renders tag container with genre only when mood is absent", () => {
    const playlist = { ...BASE_PLAYLIST, genre: "Pop" as const };
    const { container } = render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    expect(container.querySelector(".playlist-header__tags")).toBeInTheDocument();
    expect(container.querySelector(".playlist-header__tag--mood")).not.toBeInTheDocument();
  });

  it("renders tag container with mood only when genre is absent", () => {
    const playlist = { ...BASE_PLAYLIST, mood: "Focus" as const };
    const { container } = render(<PlaylistHeader playlist={playlist} tracks={TRACKS} />);
    expect(container.querySelector(".playlist-header__tags")).toBeInTheDocument();
    expect(container.querySelector(".playlist-header__tag--genre")).not.toBeInTheDocument();
  });

  it("renders all 12 possible genre values without error", () => {
    const genres: IPlaylist["genre"][] = [
      "Electronic", "Hip-Hop", "Pop", "Rock", "R&B", "Jazz",
      "Classical", "Ambient", "Country", "Latin", "Religious", "Other",
    ];
    genres.forEach((genre) => {
      const { unmount } = render(
        <PlaylistHeader playlist={{ ...BASE_PLAYLIST, genre }} tracks={TRACKS} />
      );
      expect(screen.getByText(genre!)).toBeInTheDocument();
      unmount();
    });
  });

  it("renders all 8 possible mood values without error", () => {
    const moods: IPlaylist["mood"][] = [
      "Chill", "Focus", "Workout", "Party", "Sad", "Happy", "Romantic", "Sleep",
    ];
    moods.forEach((mood) => {
      const { unmount } = render(
        <PlaylistHeader playlist={{ ...BASE_PLAYLIST, mood }} tracks={TRACKS} />
      );
      expect(screen.getByText(mood!)).toBeInTheDocument();
      unmount();
    });
  });
});
