import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import StationsPage from "@/app/(with-header)/stations/page";
import "@testing-library/jest-dom";
import type { IStation } from "@/types/station.types";

// ── Mock stationService ────────────────────────────────────────────────────────

jest.mock("@/services", () => ({
  stationService: {
    getLikedStations: jest.fn(),
    toggleLike:       jest.fn(),
  },
}));

import { stationService } from "@/services";

// ── Mock stationStore ─────────────────────────────────────────────────────────

const toggleLikeMock = jest.fn();
let mockStations: IStation[] = [];

jest.mock("@/store/stationstore", () => ({
  useStationStore: jest.fn(),
}));

// Fix 1: cast to unknown first, then to jest.Mock to avoid TS overlap error
import { useStationStore } from "@/store/stationstore";
const useStationStoreMock = useStationStore as unknown as jest.Mock;

function setMockStations(stations: IStation[]) {
  mockStations = stations;
  useStationStoreMock.mockReturnValue({
    likedStations: mockStations,
    likeStation:   jest.fn((s: IStation) => { mockStations = [...mockStations, s]; }),
    toggleLike:    toggleLikeMock,
    isLiked:       jest.fn(() => true),
  });
}

// ── Mock StationCard ──────────────────────────────────────────────────────────
// Fix 2: prop typed as IStation so coverArt/seedTrack/isLiked are present

jest.mock("@/components/Station/StationCard", () => {
  function MockStationCard({ station }: { station: IStation }) {
    const store = (
      jest.requireMock("@/store/stationstore") as { useStationStore: () => { toggleLike: (s: IStation) => void } }
    ).useStationStore();
    return (
      <div data-testid="station-card">
        <span>{station.name}</span>
        <span>{station.artistName}</span>
        <button onClick={() => store.toggleLike(station)}>Unlike</button>
      </div>
    );
  }
  MockStationCard.displayName = "MockStationCard";
  return MockStationCard;
});

// ── Mock playerStore ──────────────────────────────────────────────────────────

jest.mock("@/store/playerStore", () => ({
  usePlayerStore: () => ({
    setTrack:     jest.fn(),
    setQueue:     jest.fn(),
    currentTrack: null,
    isPlaying:    false,
    togglePlay:   jest.fn(),
  }),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SEED_TRACK = {
  id: "seed-1", title: "Midnight Echoes", artist: "Luna Waves",
  albumArt: "/test.png", genre: "Electronic", description: "",
  url: "", duration: 214, likes: 1240, plays: 58200,
  commentsCount: 34, isLiked: false,
  createdAt: "2024-11-10T00:00:00Z", updatedAt: "2024-11-10T00:00:00Z",
};

const MOCK_STATIONS: IStation[] = [
  {
    id: "station-liked-1", name: "Based on Midnight Echoes",
    artistName: "Luna Waves Station", coverArt: "/test.png",
    seedTrack: SEED_TRACK, isLiked: true, genre: "Electronic",
  },
  {
    id: "station-liked-2", name: "Based on City Rain",
    artistName: "The Wanderers Station", coverArt: "/test.png",
    seedTrack: { ...SEED_TRACK, id: "seed-2", title: "City Rain", artist: "The Wanderers" },
    isLiked: true, genre: "Indie",
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    toggleLikeMock.mockReset();
    setMockStations([]);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue([]);
    (stationService.toggleLike as jest.Mock).mockResolvedValue(undefined);
  });

  // ── Renders ──────────────────────────────────────────────────────────────

  test("renders page heading", async () => {
    await act(async () => { render(<StationsPage />); });
    expect(screen.getByText("Your Stations")).toBeInTheDocument();
  });

  test("renders subtitle", async () => {
    await act(async () => { render(<StationsPage />); });
    expect(screen.getByText(/Stations based on tracks/i)).toBeInTheDocument();
  });

  test("renders search input", async () => {
    await act(async () => { render(<StationsPage />); });
    expect(screen.getByPlaceholderText(/Filter stations/i)).toBeInTheDocument();
  });

  test("renders footer links", async () => {
    await act(async () => { render(<StationsPage />); });
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Charts")).toBeInTheDocument();
    expect(screen.getByText(/English \(US\)/i)).toBeInTheDocument();
  });

  // ── Station cards ─────────────────────────────────────────────────────────

  test("renders correct number of station cards", async () => {
    setMockStations(MOCK_STATIONS);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getAllByTestId("station-card")).toHaveLength(2);
    });
  });

  test("renders station names", async () => {
    setMockStations(MOCK_STATIONS);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getByText("Based on Midnight Echoes")).toBeInTheDocument();
      expect(screen.getByText("Based on City Rain")).toBeInTheDocument();
    });
  });

  test("renders artist names", async () => {
    setMockStations(MOCK_STATIONS);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getByText("Luna Waves Station")).toBeInTheDocument();
      expect(screen.getByText("The Wanderers Station")).toBeInTheDocument();
    });
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  test("shows empty state when no liked stations", async () => {
    setMockStations([]);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue([]);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getByText(/No liked stations yet/i)).toBeInTheDocument();
    });
  });

  test("shows hint text in empty state", async () => {
    setMockStations([]);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue([]);

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getByText(/Like a station on the home page/i)).toBeInTheDocument();
    });
  });

  // ── Search / filter ───────────────────────────────────────────────────────

  test("filters stations by name", async () => {
    setMockStations(MOCK_STATIONS);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });
    await waitFor(() => screen.getAllByTestId("station-card"));

    fireEvent.change(screen.getByPlaceholderText(/Filter stations/i), {
      target: { value: "midnight" },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("station-card")).toHaveLength(1);
      expect(screen.getByText("Based on Midnight Echoes")).toBeInTheDocument();
      expect(screen.queryByText("Based on City Rain")).not.toBeInTheDocument();
    });
  });

  test("filters by artist name", async () => {
    setMockStations(MOCK_STATIONS);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });
    await waitFor(() => screen.getAllByTestId("station-card"));

    fireEvent.change(screen.getByPlaceholderText(/Filter stations/i), {
      target: { value: "wanderers" },
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("station-card")).toHaveLength(1);
      expect(screen.getByText("Based on City Rain")).toBeInTheDocument();
    });
  });

  test("shows no-match message when filter finds nothing", async () => {
    setMockStations(MOCK_STATIONS);
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

  test("clear button restores all stations", async () => {
    setMockStations(MOCK_STATIONS);
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

  // ── Like / unlike ─────────────────────────────────────────────────────────

  test("calls toggleLike with the correct station when unlike is clicked", async () => {
    setMockStations(MOCK_STATIONS);
    (stationService.getLikedStations as jest.Mock).mockResolvedValue(MOCK_STATIONS);

    await act(async () => { render(<StationsPage />); });
    await waitFor(() => screen.getAllByTestId("station-card"));

    fireEvent.click(screen.getAllByText("Unlike")[0]);

    expect(toggleLikeMock).toHaveBeenCalledTimes(1);
    expect(toggleLikeMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "station-liked-1" })
    );
  });

  // ── Error handling ────────────────────────────────────────────────────────

  test("handles API error without crashing", async () => {
    (stationService.getLikedStations as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    let threw = false;
    try {
      await act(async () => { render(<StationsPage />); });
    } catch {
      threw = true;
    }

    expect(threw).toBe(false);
  });

  test("shows empty state when API errors and store is empty", async () => {
    setMockStations([]);
    (stationService.getLikedStations as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    await act(async () => { render(<StationsPage />); });

    await waitFor(() => {
      expect(screen.getByText(/No liked stations yet/i)).toBeInTheDocument();
    });
  });
});
