import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import StationsPage from "../app/(auth)/stations/page";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";
import { stationService } from "@/services";

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/services", () => ({
  stationService: {
    getLikedStations: jest.fn(),
    toggleLike:       jest.fn(),
  },
}));

jest.mock("@/components/Header/Header", () => () => <div data-testid="header" />);
jest.mock("@/components/Footer/Footer", () => () => <div data-testid="footer" />);

jest.mock("@/components/Station/StationCard", () =>
  function MockStationCard({
    station,
    onLikeToggle,
  }: {
    station: { id: string; name: string; artistName: string };
    onLikeToggle?: (id: string) => void;
  }) {
    return (
      <div data-testid="station-card">
        <span>{station.name}</span>
        <span>{station.artistName}</span>
        <button onClick={() => onLikeToggle?.(station.id)}>Unlike</button>
      </div>
    );
  }
);

jest.mock("@/store/playerStore", () => ({
  usePlayerStore: () => ({
    setTrack: jest.fn(),
    setQueue: jest.fn(),
  }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SEED_TRACK = {
  id:            "seed-1",
  title:         "Midnight Echoes",
  artist:        "Luna Waves",
  albumArt:      "/default-track-cover.png",
  genre:         "Electronic",
  description:   "",
  url:           "",
  duration:      214,
  likes:         0,
  plays:         0,
  commentsCount: 0,
  isLiked:       false,
  createdAt:     "2024-11-10T00:00:00Z",
  updatedAt:     "2024-11-10T00:00:00Z",
};

const MOCK_STATIONS = [
  {
    id:         "station-1",
    name:       "Based on Midnight Echoes",
    artistName: "Luna Waves Station",
    coverArt:   "/default-track-cover.png",
    seedTrack:  SEED_TRACK,
    isLiked:    true,
    genre:      "Electronic",
  },
  {
    id:         "station-2",
    name:       "Based on City Rain",
    artistName: "The Wanderers Station",
    coverArt:   "/default-track-cover.png",
    seedTrack:  { ...SEED_TRACK, id: "seed-2", title: "City Rain", artist: "The Wanderers" },
    isLiked:    true,
    genre:      "Indie",
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StationsPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (stationService.toggleLike as jest.Mock).mockResolvedValue(undefined);
  });

  test("renders header and footer", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("renders page heading", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    expect(screen.getByText("Your Stations")).toBeInTheDocument();
  });

  test("renders correct number of station cards", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getAllByTestId("station-card")).toHaveLength(2);
    });
  });

  test("renders station names", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getByText("Based on Midnight Echoes")).toBeInTheDocument();
      expect(screen.getByText("Based on City Rain")).toBeInTheDocument();
    });
  });

  test("shows empty state when no liked stations", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue([]);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getByText(/No liked stations yet/i)).toBeInTheDocument();
    });
  });

  test("filters stations by search query", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => screen.getAllByTestId("station-card"));

    const input = screen.getByPlaceholderText(/Filter stations/i);
    fireEvent.change(input, { target: { value: "midnight" } });

    await waitFor(() => {
      expect(screen.getAllByTestId("station-card")).toHaveLength(1);
      expect(screen.getByText("Based on Midnight Echoes")).toBeInTheDocument();
      expect(screen.queryByText("Based on City Rain")).not.toBeInTheDocument();
    });
  });

  test("shows no results when filter matches nothing", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => screen.getAllByTestId("station-card"));

    fireEvent.change(screen.getByPlaceholderText(/Filter stations/i), {
      target: { value: "xyznotfound" },
    });

    await waitFor(() => {
      expect(screen.getByText(/No stations matching/i)).toBeInTheDocument();
    });
  });

  test("clears search filter when clear button clicked", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => screen.getAllByTestId("station-card"));

    fireEvent.change(screen.getByPlaceholderText(/Filter stations/i), {
      target: { value: "midnight" },
    });

    await waitFor(() => screen.getByText("×"));
    fireEvent.click(screen.getByText("×"));

    await waitFor(() => {
      expect(screen.getAllByTestId("station-card")).toHaveLength(2);
    });
  });

  test("calls toggleLike when unlike button clicked", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => screen.getAllByTestId("station-card"));

    fireEvent.click(screen.getAllByText("Unlike")[0]);

    expect(stationService.toggleLike).toHaveBeenCalledWith("station-1");
  });

  test("handles API error without crashing", async () => {
    (stationService.getLikedStations as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await act(async () => { render(<StationsPage />); });

    // Should not throw — page renders without stations
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  test("renders footer links", async () => {
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Charts")).toBeInTheDocument();
  });
});
