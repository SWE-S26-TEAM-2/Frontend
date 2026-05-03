/* eslint-disable @next/next/no-img-element */
import { render, screen, fireEvent} from "@testing-library/react";
import Footer from "@/components/Footer/Footer";
import { usePlayerStore } from "@/store/playerStore";
import { useRouter } from "next/navigation";

// --- Mocks ---

// Mock Next.js Navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the Track Service
jest.mock("@/services", () => ({
  trackService: {
    getAll: jest.fn().mockResolvedValue([]),
    getRelated: jest.fn().mockResolvedValue([]),
  },
}));

// Mock the Player Store (Zustand)
jest.mock("@/store/playerStore", () => ({
  usePlayerStore: jest.fn(),
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  // Use 'ComponentPropsWithoutRef' or a simple object type to avoid 'any'
  default: ({ src, alt, width, height, className }: { 
    src: string; 
    alt: string; 
    width?: number; 
    height?: number; 
    className?: string 
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} className={className} />
  ),
}));

// Mock HTML5 Audio play/pause
beforeAll(() => {
  window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = jest.fn();
  window.HTMLMediaElement.prototype.load = jest.fn();
});

describe("Footer Component", () => {
  const mockTogglePlay = jest.fn();
  const mockPlayNext = jest.fn();
  const mockSetVolume = jest.fn();

  const mockTrack = {
    id: "1",
    title: "Test Song",
    artist: "Test Artist",
    url: "https://test.com/audio.mp3",
    duration: 180,
    albumArt: "/test.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

    // Default mock state
    (usePlayerStore as unknown as jest.Mock).mockImplementation(() => ({
      currentTrack: mockTrack,
      queue: [mockTrack],
      isPlaying: false,
      currentTime: 30,
      duration: 180,
      volume: 0.5,
      liked: false,
      shuffle: false,
      repeat: false,
      togglePlay: mockTogglePlay,
      setVolume: mockSetVolume,
      playNext: mockPlayNext,
      setQueue: jest.fn(),
      setTrack: jest.fn(),
      setLiked: jest.fn(),
      setCurrentTime: jest.fn(),
      setDuration: jest.fn(),
      toggleShuffle: jest.fn(),
      toggleRepeat: jest.fn(),
      playPrev: jest.fn(),
      addToQueue: jest.fn(),
      playFromQueue: jest.fn(),
      moveQueueItem: jest.fn(),
    }));
  });

  test("renders track info and progress correctly", () => {
    render(<Footer />);
    
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();
    // 30 seconds formatted is 0:30
    expect(screen.getByText("0:30")).toBeInTheDocument();
  });

  test("calls togglePlay when play/pause button is clicked", () => {
    render(<Footer />);
    
    const playBtn = screen.getByRole("button", { name: /play|pause/i });
    fireEvent.click(playBtn);
    
    expect(mockTogglePlay).toHaveBeenCalled();
  });

  // test("shows volume slider on hover and updates volume", async () => {
  //   render(<Footer />);
    
  //   const volumeBtn = screen.getByRole("button", { name: /volume/i });
    
  //   // Hover over the volume container
  //   fireEvent.mouseEnter(volumeBtn.parentElement!);
    
  //   const slider = screen.getByRole("slider");
  //   expect(slider).toBeVisible();

  //   fireEvent.change(slider, { target: { value: "0.8" } });
  //   expect(mockSetVolume).toHaveBeenCalledWith(0.8);
  // });

  // test("toggles the queue panel visibility", () => {
  //   render(<Footer />);
    
  //   // Click the Queue button (last button in the right section)
  //   const queueBtn = screen.getByRole("button", { name: /queue/i });
  //   fireEvent.click(queueBtn);
    
  //   expect(screen.getByText("Next up")).toBeInTheDocument();
  //   expect(screen.getByText("Autoplay station")).toBeInTheDocument();
    
  //   // Close the queue
  //   fireEvent.click(screen.getByText("✕"));
  //   expect(screen.queryByText("Next up")).not.toBeInTheDocument();
  // });

  test("triggers seek logic on progress bar click", () => {
    const mockSetCurrentTime = jest.fn();
    (usePlayerStore as unknown as jest.Mock).mockImplementation(() => ({
      currentTrack: mockTrack,
      queue: [mockTrack],
      duration: 180,
      currentTime: 0,
      isPlaying: false,
      volume: 0.5,
      liked: false,
      shuffle: false,
      repeat: false,
      setCurrentTime: mockSetCurrentTime,
      togglePlay: jest.fn(),
      setLiked: jest.fn(),
      setDuration: jest.fn(),
      setVolume: jest.fn(),
      toggleShuffle: jest.fn(),
      toggleRepeat: jest.fn(),
      playNext: jest.fn(),
      playPrev: jest.fn(),
      setQueue: jest.fn(),
      setTrack: jest.fn(),
      addToQueue: jest.fn(),
      playFromQueue: jest.fn(),
      moveQueueItem: jest.fn(),
    }));

    render(<Footer />);
    
    const progressBar = screen.getByTestId("progress-bar");

    progressBar.getBoundingClientRect = jest.fn(() => ({
      width: 200,
      left: 0,
      top: 0,
      right: 200,
      bottom: 2,
    } as DOMRect));

    fireEvent.click(progressBar, { clientX: 100 }); // Click middle (50%)

    expect(mockSetCurrentTime).toHaveBeenCalledWith(90);
  });
});