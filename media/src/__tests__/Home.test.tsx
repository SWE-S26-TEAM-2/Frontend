import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "../app/(with-header)/home/page";
import "@testing-library/jest-dom";

// IMPORTANT: import AFTER mocks
import { homeService, stationService } from "@/services";

// ─────────────────────────────────────────────
// Global mocks
// ─────────────────────────────────────────────
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
  })
) as jest.Mock;


beforeAll(() => {
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = jest.fn();
});

// ✅ Router mock
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// ✅ Auth mock (CRITICAL)
jest.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
  }),
}));

// ✅ Correct services mock (CRITICAL FIX)
jest.mock("@/services", () => ({
  homeService: {
    getHomePageData: jest.fn(),
  },
  stationService: {
    getDiscoverStations: jest.fn(),
  },
}));

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("HomePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // ✅ Mock API responses
    (homeService.getHomePageData as jest.Mock).mockResolvedValue({
      moreOfWhatYouLike: [
        {
          id: "1",
          title: "Liked Track",
          artist: "Artist A",
          albumArt: "/test.png",
          url: "",
          duration: 0,
          likes: 0,
          plays: 0,
          createdAt: "",
          updatedAt: "",
        },
      ],
      recentlyPlayed: [
        {
          id: "2",
          title: "Recent",
          artist: "Artist B",
          albumArt: "/test.png",
          url: "",
          duration: 0,
          likes: 0,
          plays: 0,
          type: "track",
          createdAt: "",
          updatedAt: "",
        },
      ],
      mixedForUser: [
        {
          id: "3",
          title: "Mixed Track",
          artist: "Artist C",
          albumArt: "/test.png",
          url: "",
          duration: 0,
          likes: 0,
          plays: 0,
          createdAt: "",
          updatedAt: "",
        },
      ],
      followSuggestions: [
        {
          id: "101",
          name: "Suggested Artist",
          followers: "1M",
          tracksCount: 0,
          imageUrl: "/test.png",
          type: "artist",
        },
      ],
      listeningHistory: [
        {
          id: "501",
          title: "History Track",
          artist: "Artist D",
          albumArt: "/test.png",
          url: "",
          duration: 0,
          likes: 0,
          plays: 0,
          createdAt: "",
          updatedAt: "",
        },
      ],
    });

    (stationService.getDiscoverStations as jest.Mock).mockResolvedValue([]);
  });

  // ─────────────────────────────────────────────

  test("renders loading state then content", async () => {
    render(<HomePage />);

    // ✅ safer async query
    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );

    expect(screen.getByText(/Recently Played/i)).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────

  test("toggles Artist Tools in Sidebar", async () => {
    render(<HomePage />);

    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );

    const toolsHeader = screen
      .getAllByText(/Artist Tools/i)
      .find(el => el.tagName === "SPAN");

    expect(toolsHeader).toBeTruthy();

    if (toolsHeader) {
      await userEvent.click(toolsHeader);
      expect(screen.getByText(/Amplify/i)).toBeInTheDocument();
    }
  });

  // ─────────────────────────────────────────────

  test("interacts with Follow button in Sidebar", async () => {
    render(<HomePage />);

    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );

    const followBtns = screen.getAllByRole("button", { name: /Follow/i });

    expect(followBtns.length).toBeGreaterThan(0);

    await userEvent.click(followBtns[0]);

  await waitFor(() => {
  expect(followBtns[0]).toHaveTextContent("Following");
});
  });
});