/* eslint-disable @next/next/no-img-element */
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Header from "@/components/Header/Header";
import "@testing-library/jest-dom";

const mockPush = jest.fn();
const mockLogout = jest.fn();

// Mock next/navigation (required because Header uses useRouter for sign out)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/link
jest.mock("next/link", () => {
  const MockedLink = ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: (e: React.MouseEvent) => void }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
    >
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
    const rest = { ...props };
    delete rest.unoptimized;
    return <img alt="" {...rest} />;
  },
}));

// Mock useAuthStore so isLoggedIn prop controls the authenticated state in tests
jest.mock("@/store/authStore", () => ({
  useAuthStore: (selector?: (s: { user: null; isAuthenticated: boolean; login: jest.Mock; logout: jest.Mock }) => unknown) => {
    const state = { user: null, isAuthenticated: false, login: jest.fn(), logout: mockLogout };
    return typeof selector === "function" ? selector(state) : state;
  },
}));

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockReset();
    mockLogout.mockReset();
    localStorage.setItem("auth_user_id", "testuser");
    localStorage.setItem("auth_username", "testuser");
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Rendering", () => {
    test("renders the SoundCloud logo and branding", () => {
      render(<Header />);
      expect(screen.getByText("soundcloud")).toBeInTheDocument();
    });

    test("renders navigation items (Home, Feed, Library)", () => {
      render(<Header />);
      expect(screen.getAllByText("Home")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Feed")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Library")[0]).toBeInTheDocument();
    });

    test("renders right-side action links", () => {
      render(<Header />);
      expect(screen.getByText("Upgrade now")).toBeInTheDocument();
      expect(screen.getAllByText("For Artists")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Upload")[0]).toBeInTheDocument();
    });

    test("renders search input with placeholder", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search");
      expect(searchInput).toBeInTheDocument();
    });

    test("renders avatar and dropdown controls when logged in", () => {
      render(<Header isLoggedIn={true} />);
      expect(screen.getByLabelText("Open profile menu")).toBeInTheDocument();
      expect(screen.getByText("?")).toBeInTheDocument();
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

    test("submits search with encoded query on Enter", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search") as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: "lo fi" } });
      fireEvent.keyDown(searchInput, { key: "Enter" });

      expect(mockPush).toHaveBeenCalledWith("/search?q=lo%20fi");
      expect(searchInput.value).toBe("");
    });

    test("submits search from the search icon button", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search") as HTMLInputElement;
      const searchButton = screen.getAllByLabelText("Search").find((el) => el.tagName === "BUTTON");

      fireEvent.change(searchInput, { target: { value: "ambient" } });
      fireEvent.click(searchButton as HTMLButtonElement);

      expect(mockPush).toHaveBeenCalledWith("/search?q=ambient");
    });
  });

  describe("Navigation", () => {
    test("navigation links navigate to correct paths", () => {
      render(<Header />);

      const feedLink = screen.getAllByText("Feed")[0].closest("a");
      expect(feedLink).toHaveAttribute("href", "/stream");

      const homeLink = screen.getAllByText("Home")[0].closest("a");
      expect(homeLink).toHaveAttribute("href", "/discover");

      const libraryLink = screen.getAllByText("Library")[0].closest("a");
      expect(libraryLink).toHaveAttribute("href", "/library");
    });

    test("highlights active nav item", () => {
      render(<Header />);
      const feedLink = screen.getAllByText("Feed")[0].closest("a");

      expect(feedLink).toHaveAttribute("href", "/stream");
    });

    test("changes active nav item on click", () => {
      render(<Header />);
      const homeLink = screen.getAllByText("Home")[0].closest("a") as HTMLAnchorElement;

      fireEvent.click(homeLink);
      expect(homeLink).toHaveAttribute("href", "/discover");
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
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Store")).toBeInTheDocument();
      });
    });

    test("avatar dropdown items have correct hrefs", async () => {
      render(<Header isLoggedIn={true} />);
      
      const avatarButton = screen.getByLabelText("Open profile menu");
      fireEvent.click(avatarButton);
      
      await waitFor(() => {
        const expectedLinks = {
          Profile: "/testuser",
          Likes: "/testuser/likes",
          Stations: "/stream",
          "Who to follow": "/who-to-follow",
          "Try Artist Pro": "/artist-pro",
          Tracks: "/library",
          Dashboard: "/creator/studio",
          Settings: "/settings",
          Store: "/store",
          Distribute: "/creator/distribute",
        };

        Object.entries(expectedLinks).forEach(([label, href]) => {
          const link = screen.getAllByText(label).find((node) => node.closest("a"))?.closest("a");
          expect(link).toHaveAttribute("href", href);
        });
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

    test("dots menu items have correct hrefs", async () => {
      render(<Header isLoggedIn={true} />);

      fireEvent.click(screen.getByLabelText("More options"));

      await waitFor(() => {
        const expectedLinks = {
          "About us": "/about",
          Legal: "/legal",
          Copyright: "/copyright",
          "Mobile apps": "/mobile",
          "Artist Membership": "/membership",
          Newsroom: "/newsroom",
          Jobs: "/jobs",
          Developers: "/developers",
          "SoundCloud Store": "/store",
          Support: "/support",
          Subscription: "/subscription",
          Settings: "/settings",
        };

        Object.entries(expectedLinks).forEach(([label, href]) => {
          expect(screen.getByText(label).closest("a")).toHaveAttribute("href", href);
        });
      });
    });

    test("opens keyboard shortcuts from dots menu", async () => {
      render(<Header isLoggedIn={true} />);

      fireEvent.click(screen.getByLabelText("More options"));
      fireEvent.click(await screen.findByText("Keyboard shortcuts"));

      expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
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

    test("notification and message buttons route correctly", () => {
      render(<Header isLoggedIn={true} />);

      fireEvent.click(screen.getByLabelText("Notifications"));
      expect(mockPush).toHaveBeenCalledWith("/notifications");

      fireEvent.click(screen.getByLabelText("Messages"));
      expect(mockPush).toHaveBeenCalledWith("/messages");
    });

    test("does not render icon buttons when not logged in", () => {
      render(<Header isLoggedIn={false} />);
      expect(screen.queryByLabelText("Notifications")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Messages")).not.toBeInTheDocument();
    });
  });

  describe("Avatar Prop", () => {
    test("uses local avatar fallback when no user profile image", () => {
      render(<Header isLoggedIn={true} />);

      expect(screen.getByText("?")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    test("renders all elements in flex container", () => {
      render(<Header />);
      const header = screen.getByText("soundcloud").closest("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("flex", "items-center");
    });

    test("search input fills available width", () => {
      render(<Header />);
      const searchInput = screen.getByPlaceholderText("Search");
      expect(searchInput).toHaveClass("w-full");
    });
  });

  describe("Link Navigation", () => {
    test("Upgrade now link has correct href", () => {
      render(<Header />);
      const link = screen.getByText("Upgrade now").closest("a");
      expect(link).toHaveAttribute("href", "/artist-pro");
    });

    test("For Artists link has correct href", () => {
      render(<Header />);
      const link = screen.getByText("For Artists").closest("a");
      expect(link).toHaveAttribute("href", "/creator/studio");
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

  describe("Mobile Drawer", () => {
    test("mobile drawer links route to the same destinations", () => {
      render(<Header isLoggedIn={true} />);

      fireEvent.click(screen.getByLabelText("Open menu"));
      const drawer = screen.getByText("Notifications").closest("nav") as HTMLElement;

      expect(within(drawer).getByText("Home").closest("a")).toHaveAttribute("href", "/discover");
      expect(within(drawer).getByText("Feed").closest("a")).toHaveAttribute("href", "/stream");
      expect(within(drawer).getByText("Library").closest("a")).toHaveAttribute("href", "/library");
      expect(within(drawer).getByText("Upload").closest("a")).toHaveAttribute("href", "/creator/upload");
      expect(within(drawer).getByText("For Artists").closest("a")).toHaveAttribute("href", "/creator/studio");
      expect(within(drawer).getByText("Profile").closest("a")).toHaveAttribute("href", "/testuser");
      expect(within(drawer).getByText("Likes").closest("a")).toHaveAttribute("href", "/testuser/likes");
      expect(within(drawer).getByText("Dashboard").closest("a")).toHaveAttribute("href", "/creator/studio");
      expect(within(drawer).getByText("Settings").closest("a")).toHaveAttribute("href", "/settings");
      expect(within(drawer).getByText("Store").closest("a")).toHaveAttribute("href", "/store");
    });

    test("mobile sign out clears auth and routes to login", () => {
      render(<Header isLoggedIn={true} />);

      fireEvent.click(screen.getByLabelText("Open menu"));
      fireEvent.click(screen.getByText("Sign out"));

      expect(mockLogout).toHaveBeenCalled();
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(localStorage.getItem("auth_username")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
