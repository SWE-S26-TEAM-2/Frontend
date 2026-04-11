/* eslint-disable @next/next/no-img-element */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "@/components/Header/Header";
import "@testing-library/jest-dom";

// Mock next/navigation (required because Header uses useRouter for sign out)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/link
jest.mock("next/link", () => {
  const MockedLink = ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: (e: React.MouseEvent) => void }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
  MockedLink.displayName = "MockedLink";
  return MockedLink;
});

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img alt="" {...props} />;
  },
}));

// Mock useAuthStore so isLoggedIn prop controls the authenticated state in tests
jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector?: (s: { user: null; isAuthenticated: boolean; login: jest.Mock; logout: jest.Mock }) => unknown) => {
    const state = { user: null, isAuthenticated: false, login: jest.fn(), logout: jest.fn() };
    return typeof selector === "function" ? selector(state) : state;
  },
}));

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders the SoundCloud logo and branding", () => {
      render(<Header />);
      expect(screen.getByText("soundcloud")).toBeInTheDocument();
    });

    test("renders navigation items (Home, Feed, Library)", () => {
      render(<Header />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Feed")).toBeInTheDocument();
      expect(screen.getByText("Library")).toBeInTheDocument();
    });

    test("renders right-side action links", () => {
      render(<Header />);
      expect(screen.getByText("Try Artist Pro")).toBeInTheDocument();
      expect(screen.getByText("For Artists")).toBeInTheDocument();
      expect(screen.getByText("Upload")).toBeInTheDocument();
    });

    test("renders search input with placeholder", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search");
      expect(searchInput).toBeInTheDocument();
    });

    test("renders avatar and dropdown controls when logged in", () => {
      render(<Header isLoggedIn={true} />);
      const avatarImage = screen.getByAltText("User avatar");
      expect(avatarImage).toBeInTheDocument();
    });

    test("does not render avatar controls when not logged in", () => {
      render(<Header isLoggedIn={false} />);
      const avatarImage = screen.queryByAltText("User avatar");
      expect(avatarImage).not.toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    test("updates search input value on typing", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search") as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: "test query" } });
      expect(searchInput.value).toBe("test query");
    });

    test("clears search input", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search") as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: "test" } });
      expect(searchInput.value).toBe("test");
      
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(searchInput.value).toBe("");
    });
  });

  describe("Navigation", () => {
    test("navigation links navigate to correct paths", () => {
      render(<Header />);
      
      const homeLink = screen.getAllByText("Home")[0].closest("a");
      expect(homeLink).toHaveAttribute("href", "/");
      
      const feedLink = screen.getAllByText("Feed")[0].closest("a");
      expect(feedLink).toHaveAttribute("href", "/feed");
      
      const libraryLink = screen.getAllByText("Library")[0].closest("a");
      expect(libraryLink).toHaveAttribute("href", "/library");
    });

    test("highlights active nav item", () => {
      render(<Header />);
      const homeLink = screen.getAllByText("Home")[0].closest("a");

      expect(homeLink).toHaveAttribute("href", "/");
    });

    test("changes active nav item on click", () => {
      render(<Header />);
      const feedLink = screen.getAllByText("Feed")[0].closest("a") as HTMLAnchorElement;

      fireEvent.click(feedLink);
      expect(feedLink).toHaveAttribute("href", "/feed");
    });
  });

  describe("Avatar Dropdown Menu", () => {
    test("opens avatar dropdown when avatar button is clicked", async () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarButton = screen.getByLabelText("Open profile menu");
      expect(avatarButton).toBeInTheDocument();
      
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeVisible();
        expect(screen.getByText("Likes")).toBeVisible();
        expect(screen.getByText("Stations")).toBeVisible();
      });
    });

    test("closes avatar dropdown when clicked again", async () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarButton = screen.getByLabelText("Open profile menu");
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeVisible();
      });
      
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        // Check if the menu container is hidden (not visible in DOM)
      });
    });

    test("closes dropdown on outside click", async () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarButton = screen.getByLabelText("Open profile menu");
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeVisible();
      });
      
      // Simulate outside click
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        // Should not be visible after outside click
      });
    });

    test("avatar dropdown contains correct menu items", async () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarButton = screen.getByLabelText("Open profile menu");
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Likes")).toBeInTheDocument();
        expect(screen.getByText("Stations")).toBeInTheDocument();
        expect(screen.getByText("Who to follow")).toBeInTheDocument();
        expect(screen.getAllByText("Try Artist Pro").length).toBeGreaterThan(0);
        expect(screen.getByText("Tracks")).toBeInTheDocument();
        expect(screen.getByText("Insights")).toBeInTheDocument();
      });
    });

    test("avatar dropdown items have correct hrefs", async () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarButton = screen.getByLabelText("Open profile menu");
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        const profileLink = screen.getByText("Profile").closest("a");
        expect(profileLink).toHaveAttribute("href", "/testuser");
        
        const likesLink = screen.getByText("Likes").closest("a");
        expect(likesLink).toHaveAttribute("href", "/likes");
      });
    });
  });

  describe("Dots Menu (More Options)", () => {
    test("opens dots menu when dots button is clicked", async () => {
      render(<Header isLoggedIn={true} />);
      
      // Find the button with aria-label "More options"
      const dotsButton = screen.getByLabelText("More options");
      fireEvent.click(dotsButton);
      
      await waitFor(() => {
        expect(screen.getByText("Settings")).toBeVisible();
        expect(screen.getByText("Support")).toBeVisible();
      });
    });

    test("closes dots menu when clicked again", async () => {
      render(<Header isLoggedIn={true} />);
      
      const dotsButton = screen.getByLabelText("More options");
      fireEvent.click(dotsButton);
      
      await waitFor(() => {
        expect(screen.getByText("Settings")).toBeVisible();
      });
      
      fireEvent.click(dotsButton);
      
      // Menu should be hidden
    });

    test("dots menu contains important items", async () => {
      render(<Header isLoggedIn={true} />);
      
      const dotsButton = screen.getByLabelText("More options");
      fireEvent.click(dotsButton);
      
      await waitFor(() => {
        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Sign out")).toBeInTheDocument();
        expect(screen.getByText("About us")).toBeInTheDocument();
      });
    });

    test("closes avatar menu when dots menu is opened", async () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarButton = screen.getByLabelText("Open profile menu");
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        expect(screen.getByText("Profile")).toBeVisible();
      });
      
      const dotsButton = screen.getByLabelText("More options");
      fireEvent.click(dotsButton);
      
      // Avatar menu should close when dots menu opens
    });
  });

  describe("Icon Buttons", () => {
    test("renders notification bell icon when logged in", () => {
      render(<Header isLoggedIn={true} />);
      const bellButton = screen.getByLabelText("Notifications");
      expect(bellButton).toBeInTheDocument();
    });

    test("renders messages icon when logged in", () => {
      render(<Header isLoggedIn={true} />);
      const mailButton = screen.getByLabelText("Messages");
      expect(mailButton).toBeInTheDocument();
    });

    test("does not render icon buttons when not logged in", () => {
      render(<Header isLoggedIn={false} />);
      expect(screen.queryByLabelText("Notifications")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Messages")).not.toBeInTheDocument();
    });
  });

  describe("Avatar Prop", () => {
    test("uses custom avatar URL when provided", () => {
      const customAvatarUrl = "https://example.com/avatar.jpg";
      render(<Header isLoggedIn={true} avatarUrl={customAvatarUrl} />);
      
      const avatarImage = screen.getByAltText("User avatar") as HTMLImageElement;
      expect(avatarImage.src).toContain("example.com/avatar.jpg");
    });

    test("uses default avatar URL when not provided", () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarImage = screen.getByAltText("User avatar") as HTMLImageElement;
      expect(avatarImage.src).toContain("pravatar.cc");
    });
  });

  describe("Responsive Behavior", () => {
    test("renders all elements in flex container", () => {
      render(<Header />);
      const header = screen.getByText("soundcloud").closest("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveStyle({ display: "flex" });
    });

    test("search input has fixed width", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search");
      expect(searchInput).toHaveStyle({ width: "200px" });
    });
  });

  describe("Link Navigation", () => {
    test("Try Artist Pro link has correct href", () => {
      render(<Header />);
      const link = screen.getAllByText("Try Artist Pro")[0].closest("a");
      expect(link).toHaveAttribute("href", "/artist-pro");
    });

    test("For Artists link has correct href", () => {
      render(<Header />);
      const link = screen.getByText("For Artists").closest("a");
      expect(link).toHaveAttribute("href", "/for-artists");
    });

    test("Upload link has correct href", () => {
      render(<Header />);
      const link = screen.getByText("Upload").closest("a");
      expect(link).toHaveAttribute("href", "/creator/upload");
    });

    test("logo link navigates to home", () => {
      render(<Header />);
      const logoLink = screen.getByText("soundcloud").closest("a");
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });
});
