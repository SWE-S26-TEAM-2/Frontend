import { render, screen, fireEvent } from "@testing-library/react";
import SlideShow from "../components/SlideShow/SlideShow"; 
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";

// --- 1. MOCKING NEXT.JS ROUTER ---
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("SlideShow Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  test("renders the first slide data correctly on load", () => {
    render(<SlideShow />);
    
   
    const mainTitle = screen.getByRole('heading', { name: /^Discover\.$/i });
    expect(mainTitle).toBeInTheDocument();
    
    expect(screen.getByText(/Get Discovered\./i)).toBeInTheDocument();
    
    // Check for the artist name
    expect(screen.getByText(/DC the Don/i)).toBeInTheDocument();
  });

  test("opens LoginModal when 'Get Started' is clicked", () => {
    render(<SlideShow />);
    
    const getStartedBtn = screen.getByText(/Get Started/i);
    fireEvent.click(getStartedBtn);
    
    expect(screen.getByText(/Sign in or create an account/i)).toBeInTheDocument();
  });

  test("navigates to artist route when artist name is clicked", () => {
    render(<SlideShow />);
    
    const artistName = screen.getByText(/DC the Don/i);
    fireEvent.click(artistName);
    
    expect(mockPush).toHaveBeenCalledWith("/dc-the-don");
  });

  test("applies underline to artist name on hover", () => {
    render(<SlideShow />);
    
    const artistName = screen.getByText(/DC the Don/i);
    
    fireEvent.mouseEnter(artistName);
    expect(artistName).toHaveStyle("text-decoration: underline");
    
    fireEvent.mouseLeave(artistName);
    expect(artistName).toHaveStyle("text-decoration: none");
  });
});