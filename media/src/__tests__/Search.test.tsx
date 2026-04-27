import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SearchPage from "@/app/(auth)/search/page";
import { useRouter, useSearchParams } from "next/navigation";
import "@testing-library/jest-dom";

// ── Root cause fix: mock the service at the exact path the page imports from ──
// The page imports from "@/services/api/search.api" not "@/services"
jest.mock("@/services/api/search.api", () => ({
  searchService: {
    searchAll:       jest.fn(),
    searchTracks:    jest.fn(),
    searchUsers:     jest.fn(),
    searchPlaylists: jest.fn(),
  },
  resolveAvatarUrl:    jest.fn((p: string | null) => p ?? "/default-avatar.png"),
  resolvePlaylistCover: jest.fn((p: string | null) => p ?? "/default-track-cover.png"),
}));

// Also mock "@/services" in case the page imports from there
jest.mock("@/services", () => ({
  searchService: {
    searchAll:       jest.fn(),
    searchTracks:    jest.fn(),
    searchUsers:     jest.fn(),
    searchPlaylists: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter:       jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/components/Track/TrackCard", () => ({
  TrackCard: ({ track }: { track: { title: string } }) => (
    <div data-testid="track-card">{track.title}</div>
  ),
}));

jest.mock("@/components/Search/SearchBar", () =>
  function MockSearchBar({ defaultValue }: { defaultValue?: string }) {
    return <input data-testid="search-bar" defaultValue={defaultValue} readOnly />;
  }
);

jest.mock("@/store/playerStore", () => ({
  usePlayerStore: () => ({
    setTrack: jest.fn(),
    setQueue: jest.fn(),
  }),
}));

// Polyfill fetch for jsdom
global.fetch = jest.fn();

// ── Import the mocked service AFTER jest.mock calls ───────────────────────────
import { searchService } from "@/services/api/search.api";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_TRACK = {
  id:            "track-1",
  title:         "Midnight Echoes",
  artist:        "Luna Waves",
  albumArt:      "/default-track-cover.png",
  genre:         "Electronic",
  description:   "Test",
  url:           "",
  duration:      214,
  likes:         1240,
  plays:         58200,
  commentsCount: 34,
  isLiked:       false,
  createdAt:     "2024-11-10T00:00:00Z",
  updatedAt:     "2024-11-10T00:00:00Z",
};

const MOCK_USER = {
  user_id:         "user-1",
  display_name:    "Luna Waves",
  bio:             null,
  location:        "Berlin",
  account_type:    "Artist",
  is_private:      false,
  profile_picture: null,
  cover_photo:     null,
  follower_count:  12400,
  following_count: 340,
  track_count:     28,
  created_at:      "2023-01-01T00:00:00Z",
};

const MOCK_PLAYLIST = {
  playlist_id:  "pl-1",
  title:        "Late Night Drives",
  description:  "Night vibes",
  cover_photo:  null,
  visibility:   "public" as const,
  track_count:  18,
  user_id:      "user-1",
  created_at:   "2024-08-01T00:00:00Z",
};

const MOCK_RESULTS = {
  tracks:    [MOCK_TRACK],
  users:     [MOCK_USER],
  playlists: [MOCK_PLAYLIST],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SearchPage", () => {
  const mockPush = jest.fn();
  const mockGet  = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
  });

  test("renders search bar", async () => {
    mockGet.mockReturnValue(null);
    await act(async () => { render(<SearchPage />); });
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
  });

  test("shows empty state when no query", async () => {
    mockGet.mockReturnValue(null);
    await act(async () => { render(<SearchPage />); });
    expect(screen.getByText(/Start typing/i)).toBeInTheDocument();
  });

  test("fetches and renders results for a query", async () => {
    mockGet.mockReturnValue("midnight");
    (searchService.searchAll as jest.Mock).mockResolvedValue(MOCK_RESULTS);

    await act(async () => { render(<SearchPage />); });

    await waitFor(() => {
      expect(screen.getByTestId("track-card")).toBeInTheDocument();
    });
  });

  test("calls searchAll with correct keyword", async () => {
    mockGet.mockReturnValue("luna");
    (searchService.searchAll as jest.Mock).mockResolvedValue(MOCK_RESULTS);

    await act(async () => { render(<SearchPage />); });

    await waitFor(() => {
      expect(searchService.searchAll).toHaveBeenCalledWith("luna");
    });
  });

  test("renders all tabs after results load", async () => {
    mockGet.mockReturnValue("test");
    (searchService.searchAll as jest.Mock).mockResolvedValue(MOCK_RESULTS);

    await act(async () => { render(<SearchPage />); });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^All/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Tracks/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^People/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Playlists/i })).toBeInTheDocument();
    });
  });

  test("switches to Tracks tab and shows only tracks", async () => {
    mockGet.mockReturnValue("test");
    (searchService.searchAll as jest.Mock).mockResolvedValue(MOCK_RESULTS);

    await act(async () => { render(<SearchPage />); });

    await waitFor(() =>
      screen.getByRole("button", { name: /^Tracks/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /^Tracks/i }));

    await waitFor(() => {
      expect(screen.getByTestId("track-card")).toBeInTheDocument();
      expect(screen.queryByText("Late Night Drives")).not.toBeInTheDocument();
    });
  });

  test("shows no results message when searchAll returns empty", async () => {
    mockGet.mockReturnValue("xyznotfound");
    (searchService.searchAll as jest.Mock).mockResolvedValue({
      tracks: [], users: [], playlists: [],
    });

    await act(async () => { render(<SearchPage />); });

    await waitFor(() => {
      expect(screen.getByText(/No results/i)).toBeInTheDocument();
    });
  });

  test("shows result count", async () => {
    mockGet.mockReturnValue("luna");
    (searchService.searchAll as jest.Mock).mockResolvedValue(MOCK_RESULTS);

    await act(async () => { render(<SearchPage />); });

    await waitFor(() => {
      // 1 track + 1 user + 1 playlist = 3 results
      expect(screen.getByText(/3 result/i)).toBeInTheDocument();
    });
  });

  test("handles API error without crashing", async () => {
    mockGet.mockReturnValue("error-query");
    (searchService.searchAll as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await act(async () => { render(<SearchPage />); });

    await waitFor(() => {
      // Use queryAllByText to avoid "multiple elements" error
      const errorEls = screen.queryAllByText(/fetch is not defined|Network error/i);
      expect(errorEls.length).toBeGreaterThan(0);
    });
  });
});
