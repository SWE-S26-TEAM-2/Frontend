import { render, screen, waitFor, act } from "@testing-library/react";
import FeedPage from "@/app/(auth)/feed/page";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock at both possible import paths
jest.mock("@/services", () => ({
  feedService: {
    getFeedPageData: jest.fn(),
  },
}));

jest.mock("@/services/api/feed.api", () => ({
  feedService: {
    getFeedPageData: jest.fn(),
  },
}));

jest.mock("@/components/Header/Header",   () => () => <div data-testid="header" />);
jest.mock("@/components/Footer/Footer",   () => () => <div data-testid="footer" />);
jest.mock("@/components/Home/SideBar",    () => () => <div data-testid="sidebar" />);
jest.mock("@/components/Track/TrackCard", () => ({
  TrackCard: ({ track }: { track: { title: string } }) => (
    <div data-testid="track-card">{track.title}</div>
  ),
}));

jest.mock("@/store/playerStore", () => ({
  usePlayerStore: () => ({
    setTrack: jest.fn(),
    setQueue: jest.fn(),
  }),
}));

// Import mocked service after jest.mock calls
import { feedService } from "@/services";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_TRACK = {
  id:            "feed-1",
  title:         "Neon Skies",
  artist:        "Luna Waves",
  albumArt:      "/default-track-cover.png",
  genre:         "Electronic",
  description:   "Test description",
  url:           "",
  duration:      237,
  likes:         3400,
  plays:         128000,
  commentsCount: 74,
  isLiked:       false,
  createdAt:     "2025-03-01T00:00:00Z",
  updatedAt:     "2025-03-01T00:00:00Z",
};

const MOCK_FEED_DATA = {
  feedTracks:        [MOCK_TRACK],
  followSuggestions: [],
  listeningHistory:  [],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("FeedPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  test("renders header and footer", async () => {
    (feedService.getFeedPageData as jest.Mock).mockResolvedValue(MOCK_FEED_DATA);

    await act(async () => { render(<FeedPage />); });

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("shows loading state initially", async () => {
    (feedService.getFeedPageData as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<FeedPage />);

    expect(screen.getByText(/Loading Feed/i)).toBeInTheDocument();
  });

  test("renders feed tracks after loading", async () => {
    (feedService.getFeedPageData as jest.Mock).mockResolvedValue(MOCK_FEED_DATA);

    await act(async () => { render(<FeedPage />); });

    await waitFor(() => {
      expect(screen.getByText("Neon Skies")).toBeInTheDocument();
    });
  });

  test("renders page heading and subtitle", async () => {
    (feedService.getFeedPageData as jest.Mock).mockResolvedValue(MOCK_FEED_DATA);

    await act(async () => { render(<FeedPage />); });

    expect(screen.getByText("Your Feed")).toBeInTheDocument();
    expect(screen.getByText(/Hear the latest posts/i)).toBeInTheDocument();
  });

  test("shows empty state when no feed tracks", async () => {
    (feedService.getFeedPageData as jest.Mock).mockResolvedValue({
      ...MOCK_FEED_DATA,
      feedTracks: [],
    });

    await act(async () => { render(<FeedPage />); });

    await waitFor(() => {
      expect(screen.getByText(/Your feed is empty/i)).toBeInTheDocument();
    });
  });

  test("shows explore button in empty state and navigates on click", async () => {
    (feedService.getFeedPageData as jest.Mock).mockResolvedValue({
      ...MOCK_FEED_DATA,
      feedTracks: [],
    });

    await act(async () => { render(<FeedPage />); });

    await waitFor(() => {
      const btn = screen.getByText(/Find artists to follow/i);
      expect(btn).toBeInTheDocument();
      btn.click();
      expect(mockPush).toHaveBeenCalledWith("/search");
    });
  });

  test("renders correct number of track cards", async () => {
    (feedService.getFeedPageData as jest.Mock).mockResolvedValue({
      ...MOCK_FEED_DATA,
      feedTracks: [MOCK_TRACK, { ...MOCK_TRACK, id: "feed-2", title: "City Rain" }],
    });

    await act(async () => { render(<FeedPage />); });

    await waitFor(() => {
      expect(screen.getAllByTestId("track-card")).toHaveLength(2);
    });
  });

  test("handles API error gracefully — shows loading then nothing crashes", async () => {
    (feedService.getFeedPageData as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    // The page renders null when data is null after error
    // so we just verify it doesn't throw
    let threw = false;
    try {
      await act(async () => { render(<FeedPage />); });
    } catch {
      threw = true;
    }

    expect(threw).toBe(false);
  });
});
