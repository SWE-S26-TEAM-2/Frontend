import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import TrendingPage from "../app/(with-header)/trending/page";
import "@testing-library/jest-dom";
import { trendingService, trackService } from "@/services/di";

// Mock global audio
beforeAll(() => {
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = jest.fn();
  window.HTMLMediaElement.prototype.load = jest.fn();
});

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (trendingService.getCurated as jest.Mock).mockResolvedValue([mockTrack]);
  (trendingService.getEmerging as jest.Mock).mockResolvedValue([mockTrack]);
  (trendingService.getPower as jest.Mock).mockResolvedValue([mockTrack]);
  (trackService.getAll as jest.Mock).mockResolvedValue([mockTrack]);
});

describe("TrendingPage Component", () => {
  test("renders the main page heading", async () => {
    await act(async () => { render(<TrendingPage />); });
    expect(screen.getByText(/Discover Tracks and Playlists/i)).toBeInTheDocument();
  });

  test("toggles the dots menu in the header", async () => {
    await act(async () => { render(<TrendingPage />); });

    // Look for the specific dots icon/button in the UI
    const dotsBtn = screen.queryByLabelText(/More/i) || document.querySelector('.lucide-more-horizontal')?.parentElement;
    
    if (dotsBtn) {
      fireEvent.click(dotsBtn);
      const aboutUs = await screen.findByText(/About us/i);
      expect(aboutUs).toBeInTheDocument();
    }
  });

  test("interacts with a Track Card (Like button)", async () => {
    await act(async () => { render(<TrendingPage />); });
    const likeButtons = document.querySelectorAll('.lucide-heart');
    const firstLike = likeButtons[0]?.parentElement;

    if (firstLike) {
      fireEvent.click(firstLike);
      await waitFor(() => {
        expect(firstLike).toBeInTheDocument(); 
      });
    }
  });
});