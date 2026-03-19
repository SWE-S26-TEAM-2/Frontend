import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Home from "../app/(auth)/page"; 
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";
import { LandingApiService } from "@/services/api/landing.api";

// 1. Mock Next.js Router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// 2. Mock the Landing API Service
jest.mock("@/services/api/landing.api", () => ({
  LandingApiService: {
    getLandingData: jest.fn(),
    getTrendingTracks: jest.fn(),
    getSliderContent: jest.fn().mockResolvedValue([
      {
        id: 1,
        image: "/test.jpg",
        artistName: "DC the Don",
        artistRoute: "/dc-the-don",
        titles: ["Discover.", "Get Discovered."],
        description: "Test description",
        buttonText: "Get Started"
      }
    ]),
  },
}));

describe("Home Component (Landing Page)", () => {
  const mockPush = jest.fn();
  
  const mockContent = {
    trendingTagline: "Charts: Top 50",
    creatorSection: { 
      title: "Calling all creators", 
      text: "Get on SoundCloud to connect with fans", 
      button: "Find out more" 
    },
    footerLinks: ["Legal", "Privacy", "Cookie Policy"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    (LandingApiService.getLandingData as jest.Mock).mockResolvedValue(mockContent);
    (LandingApiService.getTrendingTracks as jest.Mock).mockResolvedValue([
      { id: 1, title: "Mock Track", artist: "Mock Artist" }
    ]);
    
    localStorage.clear();
  });

  test("redirects to /discover if auth_token exists", async () => {
    localStorage.setItem("auth_token", "fake-token");
    await act(async () => {
      render(<Home />);
    });
    expect(mockPush).toHaveBeenCalledWith("/discover");
  });

  test("renders the marketing tagline from API", async () => {
    await act(async () => {
      render(<Home />);
    });
    expect(screen.getByText(/Charts: Top 50/i)).toBeInTheDocument();
  });

  test("opens LoginModal when Sign in button is clicked", async () => {
    await act(async () => {
      render(<Home />);
    });

    // Pick the first "Sign in" button found (usually in the header)
    const signInButtons = screen.getAllByText(/Sign in/i);
    fireEvent.click(signInButtons[0]);
    
    // We search for the unique heading text inside your LoginModal
    await waitFor(() => {
      expect(screen.getByText(/Sign in or create an account/i)).toBeInTheDocument();
    });
  });

  test("updates search input value", async () => {
    await act(async () => {
      render(<Home />);
    });
    const searchInput = screen.getByPlaceholderText(/Search for artists/i) as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: "Drake" } });
    expect(searchInput.value).toBe("Drake");
  });
});