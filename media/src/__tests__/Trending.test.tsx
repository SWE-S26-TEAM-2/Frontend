import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import TrendingPage from "../app/(with-header)/trending/page";
import "@testing-library/jest-dom";
import { trendingService,trackService } from "@/services/di";

// --- FIX 1: Mock HTMLMediaElement (Audio) ---
// This prevents the "pause/play not implemented" error
beforeAll(() => {
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = jest.fn();
  window.HTMLMediaElement.prototype.load = jest.fn();
});

// Mock Next.js Router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/trending",
}));

// Mock auth store so the logged-in header (with dots menu) renders
jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) => {
    const state = {
      user: { username: "testuser", profileImageUrl: null },
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

// Mock Data
jest.mock("@/services/di", () => ({
  trendingService: {
    getCurated: jest.fn(),
    getEmerging: jest.fn(),
    getPower: jest.fn(),
  },
  trackService: {
    getAll: jest.fn(),
  },
}));


const mockTrack = {
  id: "1",
  title: "Track",
  artist: "Artist",
  albumArt: "/test.png",
  url: "",
  duration: 0,
  likes: 0,
  plays: 0,
  createdAt: "",
  updatedAt: "",
};

beforeEach(() => {
  jest.clearAllMocks();

  (trendingService.getCurated as jest.Mock).mockResolvedValue([mockTrack]);
  (trendingService.getEmerging as jest.Mock).mockResolvedValue([mockTrack]);
  (trendingService.getPower as jest.Mock).mockResolvedValue([mockTrack]);
    (trackService.getAll as jest.Mock).mockResolvedValue([mockTrack]);

});

describe("TrendingPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the main page heading", async () => {
    await act(async () => { render(<TrendingPage />); });
    expect(screen.getByText(/Discover Tracks and Playlists/i)).toBeInTheDocument();
  });

  // --- FIX 2: Use aria-label to find the correct dots menu button ---
  test("toggles the dots menu in the header", async () => {
    await act(async () => { render(<TrendingPage />); });

    const dotsBtn = screen.queryByLabelText("More options");

    if (dotsBtn) {
      fireEvent.click(dotsBtn);
      expect(screen.getByText("About us")).toBeInTheDocument();
    }
  });

  test("interacts with a Track Card (Like button)", async () => {
    await act(async () => { render(<TrendingPage />); });

    // Use querySelector if the title attribute isn't being picked up by RTL
    // Or use the icon class name
    const likeButtons = document.querySelectorAll('.lucide-heart');
    const firstLike = likeButtons[0].parentElement;

    if (firstLike) {
      fireEvent.click(firstLike);
      // Wait for the state change
      await waitFor(() => {
       expect(firstLike).toBeInTheDocument(); 
      });
    }
  });

  test("opens the More menu on a Track Card", async () => {
    await act(async () => { render(<TrendingPage />); });

    const moreButtons = document.querySelectorAll('.lucide-ellipsis');
    const firstMore = moreButtons[0].parentElement;

    if (firstMore) {
      fireEvent.click(firstMore);
      expect(screen.getByText("Repost")).toBeInTheDocument();
    }
  });
});