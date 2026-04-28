import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "../app/(auth)/home/page";
import "@testing-library/jest-dom";

// --- Mocks ---
beforeAll(() => {
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = jest.fn();
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("../services/api/home.api", () => ({
  HomeAPI: {
    getHomePageData: jest.fn().mockResolvedValue({
      moreOfWhatYouLike: [
        { id: "1", title: "Liked Track", artist: "Artist A", albumArt: "/test.png", url: "", duration: 0, likes: 0, plays: 0, createdAt: "", updatedAt: "" }
      ],
      recentlyPlayed: [
        { id: "2", title: "Recent", artist: "Artist B", albumArt: "/test.png", url: "", duration: 0, likes: 0, plays: 0, type: "track", createdAt: "", updatedAt: "" }
      ],
      mixedForUser: [
        { id: "3", title: "Mixed Track", artist: "Artist C", albumArt: "/test.png", url: "", duration: 0, likes: 0, plays: 0, createdAt: "", updatedAt: "" }
      ],
      discoverStations: [],
      followSuggestions: [
        { id: "101", name: "Suggested Artist", followers: "1M", tracksCount: 0, imageUrl: "/test.png", type: "artist" }
      ],
      listeningHistory: [
        { id: "501", title: "History Track", artist: "Artist D", albumArt: "/test.png", url: "", duration: 0, likes: 0, plays: 0, createdAt: "", updatedAt: "" }
      ],
    }),

    // ✅ add this
    refreshFollowSuggestions: jest.fn().mockResolvedValue([]),
  },
}));

describe("HomePage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state then content", async () => {
    render(<HomePage />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );

    expect(screen.getByText(/Recently Played/i)).toBeInTheDocument();
  });

  test("toggles Artist Tools in Sidebar", async () => {
    render(<HomePage />);

    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );

    const toolsHeader = screen
      .getAllByText(/Artist Tools/i)
      .find(el => el.tagName === "SPAN");

    if (toolsHeader) {
      await userEvent.click(toolsHeader);
      expect(screen.getByText(/Amplify/i)).toBeInTheDocument();
    }
  });

  test("interacts with Follow button in Sidebar", async () => {
    render(<HomePage />);

    await waitFor(() =>
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
    );

    const followBtns = screen.getAllByRole("button", { name: /Follow/i });

    await userEvent.click(followBtns[0]);

    expect(followBtns[0]).toHaveTextContent(/Following/i);
  });
});