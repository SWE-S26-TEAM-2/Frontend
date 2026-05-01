import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SlideShow from "../components/SlideShow/SlideShow"; 
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
    getSliderContent: jest.fn(),
  },
}));

jest.mock("@react-oauth/google", () => ({
  GoogleLogin: () => null,
}));

jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector?: (s: { user: null; isAuthenticated: boolean; login: jest.Mock; logout: jest.Mock }) => unknown) => {
    const state = { user: null, isAuthenticated: false, login: jest.fn(), logout: jest.fn() };
    return typeof selector === "function" ? selector(state) : state;
  },
}));

describe("SlideShow Component", () => {
  const mockPush = jest.fn();
  
  // Fake data that matches what the component expects
  const mockSlides = [
    {
      id: 1,
      image: "/test.jpg",
      artistName: "DC the Don",
      artistRoute: "/dc-the-don",
      titles: ["Discover.", "Get Discovered."],
      description: "Test description",
      buttonText: "Get Started"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    // Force the API mock to return our fake data
    (LandingApiService.getSliderContent as jest.Mock).mockResolvedValue(mockSlides);
  });

  test("renders the first slide data correctly after loading", async () => {
    await act(async () => {
      render(<SlideShow />);
    });

    // waitFor is the hero here—it waits for the loading span to disappear
    await waitFor(() => {
      expect(screen.getByText(/DC the Don/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Discover\./i)).toBeInTheDocument();
    expect(screen.getByText(/Get Discovered\./i)).toBeInTheDocument();
  });

  test("opens LoginModal when 'Get Started' is clicked", async () => {
    await act(async () => {
      render(<SlideShow />);
    });

    await waitFor(() => expect(screen.getByText(/Get Started/i)).toBeInTheDocument());
    
    const getStartedBtn = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedBtn);
    
    // Adjust this text to match whatever is inside your LoginModal
    expect(screen.getByText(/Sign in or create an account/i)).toBeInTheDocument();
  });

  test("navigates to artist route when artist name is clicked", async () => {
    await act(async () => {
      render(<SlideShow />);
    });
    
    await waitFor(() => expect(screen.getByText(/DC the Don/i)).toBeInTheDocument());
    
    const artistName = screen.getByText(/DC the Don/i);
    fireEvent.click(artistName);
    
    expect(mockPush).toHaveBeenCalledWith("/dc-the-don");
  });

  test("applies underline class to artist name on hover", async () => {
    await act(async () => {
      render(<SlideShow />);
    });
    
    await waitFor(() => expect(screen.getByText(/DC the Don/i)).toBeInTheDocument());
    
    const artistName = screen.getByText(/DC the Don/i);
    
    fireEvent.mouseEnter(artistName);
    // Since we use Tailwind, we check for the class "underline"
    expect(artistName).toHaveClass("underline");
    
    fireEvent.mouseLeave(artistName);
    expect(artistName).not.toHaveClass("underline");
  });
});