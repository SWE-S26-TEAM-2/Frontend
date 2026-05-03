import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header/Header";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";

// --- Mocks ---

// Mock Next.js Navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/home"),
}));

// Mock the Auth Store (Zustand)
jest.mock("@/store/authStore", () => ({
  useAuthStore: jest.fn(),
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // We disable the Next.js img warning because this is just a test mock
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || "mock image"} />
  ),
}));
// Mock the KeyboardShortcutsModal to simplify the DOM
jest.mock("@/components/KeyboardShortcutsModal/KeyboardShortcutsModal", () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="shortcuts-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe("Header Component", () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue("/home");
    
    // Default mock state: Not logged in
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: mockLogout,
      })
    );
  });

  test("renders SoundCloud logo and main navigation", () => {
    render(<Header />);
    expect(screen.getByLabelText(/SoundCloud/i)).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
  });

  test("shows 'Sign in' and 'Create account' buttons when not logged in", () => {
    render(<Header isLoggedIn={false} />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  test("shows user actions (notifications, messages) when logged in", () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        user: { username: "testuser", id: "123" },
        isAuthenticated: true,
        logout: mockLogout,
      })
    );

    render(<Header />);
    
    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
    expect(screen.getByLabelText("Messages")).toBeInTheDocument();
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
  });

  test("opens the 'More' (dots) menu and triggers sign out", async () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        user: { username: "testuser", id: "123" },
        isAuthenticated: true,
        logout: mockLogout,
      })
    );

    render(<Header />);
    
    const dotsButton = screen.getByLabelText("More options");
    fireEvent.click(dotsButton);

    const signOutButton = screen.getByText("Sign out");
    expect(signOutButton).toBeInTheDocument();

    fireEvent.click(signOutButton);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  test("opens keyboard shortcuts modal from dots menu", () => {
    (useAuthStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        user: { username: "testuser", id: "123" },
        isAuthenticated: true,
        logout: mockLogout,
      })
    );

    render(<Header />);
    
    fireEvent.click(screen.getByLabelText("More options"));
    fireEvent.click(screen.getByText("Keyboard shortcuts"));

    expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();
  });

  test("opens mobile drawer when hamburger is clicked", () => {
    render(<Header />);
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    
    // The mobile drawer contains navigation links like "Trending"
    expect(screen.getByText("Trending")).toBeInTheDocument();
  });
});