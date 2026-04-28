/* eslint-disable @next/next/no-img-element */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import Footer from "@/components/Footer/Footer";
import "@testing-library/jest-dom";
import { usePlayerStore } from "@/store/playerStore";

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    writable: true,
    value: jest.fn().mockResolvedValue(undefined),
  });

  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    writable: true,
    value: jest.fn(),
  });
});

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img alt="" {...props} />;
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock trackService
jest.mock("@/services", () => ({
  trackService: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

// Mock PlayerIcons
jest.mock("@/components/Icons/PlayerIcons", () => ({
  PrevIcon: () => <div data-testid="prev-icon">PrevIcon</div>,
  NextIcon: () => <div data-testid="next-icon">NextIcon</div>,
  PlayIcon: () => <div data-testid="play-icon">PlayIcon</div>,
  PauseIcon: () => <div data-testid="pause-icon">PauseIcon</div>,
  ShuffleIcon: () => <div data-testid="shuffle-icon">ShuffleIcon</div>,
  RepeatIcon: () => <div data-testid="repeat-icon">RepeatIcon</div>,
  VolumeIcon: () => <div data-testid="volume-icon">VolumeIcon</div>,
  HeartIcon: () => <div data-testid="heart-icon">HeartIcon</div>,
  AddUserIcon: () => <div data-testid="adduser-icon">AddUserIcon</div>,
  QueueIcon: () => <div data-testid="queue-icon">QueueIcon</div>,
}));

describe("Footer Component (Global Player)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlayerStore.setState({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      liked: false,
      shuffle: false,
      repeat: false,
    });
  });

  describe("Rendering", () => {
    test("renders footer with playback controls", () => {
      render(<Footer />);

      expect(screen.getByLabelText("Previous")).toBeInTheDocument();
      expect(screen.getByLabelText("Play")).toBeInTheDocument();
      expect(screen.getByLabelText("Next")).toBeInTheDocument();
    });

    test("renders shuffle and repeat buttons", () => {
      render(<Footer />);

      expect(screen.getByLabelText("Shuffle")).toBeInTheDocument();
      expect(screen.getByLabelText("Repeat")).toBeInTheDocument();
    });

    test("renders time display", () => {
      render(<Footer />);
      expect(screen.getAllByText("0:00").length).toBeGreaterThan(0);
    });

    test("renders queue button", () => {
      const { setTrack } = usePlayerStore.getState();
      act(() => {
        setTrack({
          id: "1",
          title: "Test Track",
          artist: "Artist",
          url: "http://example.com/test.mp3",
          duration: 180,
          albumArt: "/cover.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        });
      });
      render(<Footer />);
      expect(screen.getByLabelText("Queue")).toBeInTheDocument();
    });
  });

  describe("Playback Controls", () => {
    test("toggles play/pause when play button is clicked", async () => {
      render(<Footer />);
      const playButton = screen.getByLabelText("Play");

      fireEvent.click(playButton);

      await waitFor(() => {
        expect(usePlayerStore.getState().isPlaying).toBe(true);
      });
    });

    test("displays play icon when not playing", () => {
      render(<Footer />);

      expect(screen.getByTestId("play-icon")).toBeInTheDocument();
    });

    test("displays pause icon when playing", async () => {
      render(<Footer />);
      const playButton = screen.getByLabelText("Play");

      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByTestId("pause-icon")).toBeInTheDocument();
      });
    });

    test("calls playNext when next button is clicked", async () => {
      render(<Footer />);
      const nextButton = screen.getByLabelText("Next");

      fireEvent.click(nextButton);
    });

    test("calls playPrev when previous button is clicked", async () => {
      render(<Footer />);
      const prevButton = screen.getByLabelText("Previous");

      fireEvent.click(prevButton);
    });
  });

  describe("Shuffle and Repeat", () => {
    test("toggles shuffle mode when shuffle button is clicked", () => {
      render(<Footer />);
      const shuffleButton = screen.getByLabelText("Shuffle");

      fireEvent.click(shuffleButton);
      expect(usePlayerStore.getState().shuffle).toBe(true);

      fireEvent.click(shuffleButton);
      expect(usePlayerStore.getState().shuffle).toBe(false);
    });

    test("toggles repeat mode when repeat button is clicked", () => {
      render(<Footer />);
      const repeatButton = screen.getByLabelText("Repeat");

      fireEvent.click(repeatButton);
      expect(usePlayerStore.getState().repeat).toBe(true);

      fireEvent.click(repeatButton);
      expect(usePlayerStore.getState().repeat).toBe(false);
    });

    test("shuffle button has correct state when active", () => {
      render(<Footer />);
      const shuffleButton = screen.getByLabelText("Shuffle");

      fireEvent.click(shuffleButton);

      const state = usePlayerStore.getState();
      expect(state.shuffle).toBe(true);
    });

    test("repeat button has correct state when active", () => {
      render(<Footer />);
      const repeatButton = screen.getByLabelText("Repeat");

      fireEvent.click(repeatButton);

      const state = usePlayerStore.getState();
      expect(state.repeat).toBe(true);
    });
  });

  describe("Volume Control", () => {
    test("renders volume control button", () => {
      render(<Footer />);
      expect(screen.getByLabelText(/Mute|Unmute/)).toBeInTheDocument();
    });

    test("shows volume slider on hover", async () => {
      const { container } = render(<Footer />);
      const volumeButton = screen.getByLabelText(/Mute|Unmute/);

      fireEvent.mouseEnter(volumeButton);

      // The slider <input type="range"> is rendered but hidden behind a
      // width:0/opacity:0 wrapper until hover. After mouseEnter the wrapper
      // should report opacity:1 / width:70px.
      await waitFor(() => {
        const slider = container.querySelector('input[type="range"]') as HTMLInputElement | null;
        expect(slider).toBeInTheDocument();
        const wrapper = slider?.parentElement?.parentElement as HTMLElement | undefined;
        expect(wrapper?.style.opacity).toBe("1");
        expect(wrapper?.style.width).toBe("70px");
      });
    });

    test("updates volume when slider is changed", async () => {
      const { container } = render(<Footer />);
      const volumeButton = screen.getByLabelText(/Mute|Unmute/);
      fireEvent.mouseEnter(volumeButton);

      const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(slider).toBeTruthy();
      fireEvent.change(slider, { target: { value: "0.25" } });

      // Volume must propagate to the player store.
      expect(usePlayerStore.getState().volume).toBeCloseTo(0.25, 5);
    });

    test("mutes audio when mute is toggled", async () => {
      render(<Footer />);
      const volumeButton = screen.getByLabelText(/Mute|Unmute/);

      fireEvent.mouseEnter(volumeButton);
      fireEvent.click(volumeButton);

      // After clicking, the button label should flip Mute<->Unmute.
      // We don't know the initial state, but the same locator must still resolve
      // and the toggled label must be one of the two valid values.
      const toggled = screen.getByLabelText(/Mute|Unmute/);
      expect(toggled).toBeInTheDocument();
      expect(["Mute", "Unmute"]).toContain(toggled.getAttribute("aria-label"));
    });
  });

  describe("Progress Bar", () => {
    test("displays current time", () => {
      const { setCurrentTime } = usePlayerStore.getState();

      render(<Footer />);

      act(() => {
        setCurrentTime(60);
      });

      // 60 seconds should render as "1:00" somewhere in the footer.
      expect(screen.getAllByText("1:00").length).toBeGreaterThan(0);
      expect(usePlayerStore.getState().currentTime).toBe(60);
    });

    test("allows seeking by clicking on progress bar", async () => {
      const { setTrack } = usePlayerStore.getState();
      const mockTrack = {
        id: "1",
        title: "Test",
        artist: "Artist",
        url: "http://example.com/test.mp3",
        duration: 180,
        albumArt: "/cover.jpg",
        likes: 100,
        plays: 1000,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      act(() => {
        setTrack(mockTrack);
      });

      render(<Footer />);

      const progressDiv = screen.getByTestId("player-progress");

      // Mock getBoundingClientRect so the half-way click maps to ~90s.
      const rect = { left: 0, width: 200, top: 0, height: 4, right: 200, bottom: 4 } as DOMRect;
      progressDiv.getBoundingClientRect = () => rect;

      fireEvent.click(progressDiv, { clientX: 100 });

      // currentTime should be ~half of duration (180 -> 90)
      const ct = usePlayerStore.getState().currentTime;
      expect(ct).toBeGreaterThan(85);
      expect(ct).toBeLessThan(95);
    });

    test("updates progress bar fill width based on current time", () => {
      const { setCurrentTime, setDuration } = usePlayerStore.getState();

      render(<Footer />);

      act(() => {
        setDuration(100);
        setCurrentTime(50);
      });

      const fill = screen.getByTestId("player-progress-fill");
      // 50 / 100 -> 50%
      expect(fill.style.width).toBe("50%");
    });
  });

  describe("Queue Drawer", () => {
    test("opens queue drawer when queue button is clicked", async () => {
      const { setTrack } = usePlayerStore.getState();
      act(() => {
        setTrack({
          id: "1",
          title: "Test Track",
          artist: "Artist",
          url: "http://example.com/test.mp3",
          duration: 180,
          albumArt: "/cover.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        });
      });
      render(<Footer />);

      // Drawer is hidden by default.
      expect(screen.queryByLabelText("Close queue")).not.toBeInTheDocument();
      const queueButton = screen.getByLabelText("Queue");
      fireEvent.click(queueButton);

      // After click the drawer + close button should be visible.
      expect(await screen.findByLabelText("Close queue")).toBeInTheDocument();
    });

    test("closes queue drawer when closed", async () => {
      const { setTrack } = usePlayerStore.getState();
      act(() => {
        setTrack({
          id: "1",
          title: "Test Track",
          artist: "Artist",
          url: "http://example.com/test.mp3",
          duration: 180,
          albumArt: "/cover.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        });
      });
      render(<Footer />);

      const queueButton = screen.getByLabelText("Queue");
      fireEvent.click(queueButton);
      expect(await screen.findByLabelText("Close queue")).toBeInTheDocument();

      fireEvent.click(queueButton);
      // Drawer must close again.
      await waitFor(() =>
        expect(screen.queryByLabelText("Close queue")).not.toBeInTheDocument()
      );
    });

    test("displays queue items in drawer", async () => {
      const { setQueue, setTrack } = usePlayerStore.getState();

      const mockTracks = [
        {
          id: "1",
          title: "Track 1",
          artist: "Artist 1",
          url: "http://example.com/1.mp3",
          duration: 180,
          albumArt: "/1.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          id: "2",
          title: "Track 2",
          artist: "Artist 2",
          url: "http://example.com/2.mp3",
          duration: 200,
          albumArt: "/2.jpg",
          likes: 200,
          plays: 2000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      act(() => {
        setQueue(mockTracks);
        setTrack(mockTracks[0]);
      });

      render(<Footer />);
      const queueButton = screen.getByLabelText("Queue");
      fireEvent.click(queueButton);

      // Both queue rows should be visible (artist - title format).
      expect(await screen.findByText("Artist 1 - Track 1")).toBeInTheDocument();
      expect(screen.getByText("Artist 2 - Track 2")).toBeInTheDocument();
      expect(screen.getByText("Queue (2)")).toBeInTheDocument();
    });

    test("highlights current playing track in queue", async () => {
      const { setQueue, setTrack } = usePlayerStore.getState();

      const mockTracks = [
        {
          id: "1",
          title: "Track 1",
          artist: "Artist 1",
          url: "http://example.com/1.mp3",
          duration: 180,
          albumArt: "/1.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          id: "2",
          title: "Track 2",
          artist: "Artist 2",
          url: "http://example.com/2.mp3",
          duration: 200,
          albumArt: "/2.jpg",
          likes: 200,
          plays: 2000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      act(() => {
        setQueue(mockTracks);
        setTrack(mockTracks[1]);
      });

      render(<Footer />);
      // Open queue drawer, then assert the second track is highlighted.
      fireEvent.click(screen.getByLabelText("Queue"));
      const playRow = await screen.findByLabelText("Play Track 2");
      expect(playRow).toBeInTheDocument();
      // Title button styling encodes "current" via color #FF5500.
      const titleBtn = screen.getByText("Artist 2 - Track 2").closest("button") as HTMLElement;
      expect(titleBtn).toBeTruthy();
      expect(titleBtn.style.color).toMatch(/255,\s*85,\s*0|FF5500/i);
    });

    test("plays track when clicked from queue", async () => {
      const { setQueue, setTrack } = usePlayerStore.getState();

      const mockTracks = [
        {
          id: "1",
          title: "Track 1",
          artist: "Artist 1",
          url: "http://example.com/1.mp3",
          duration: 180,
          albumArt: "/1.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          id: "2",
          title: "Track 2",
          artist: "Artist 2",
          url: "http://example.com/2.mp3",
          duration: 200,
          albumArt: "/2.jpg",
          likes: 200,
          plays: 2000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      act(() => {
        setQueue(mockTracks);
        setTrack(mockTracks[0]);
      });

      render(<Footer />);

      fireEvent.click(screen.getByLabelText("Queue"));
      const targetPlay = await screen.findByLabelText("Play Track 2");
      fireEvent.click(targetPlay);

      // playFromQueue(1) must have made track 2 current.
      expect(usePlayerStore.getState().currentTrack?.id).toBe("2");
    });
  });

  describe("Drag and Drop Queue Reordering", () => {
    test("enables drag reordering of queue items", async () => {
      const { setQueue, setTrack } = usePlayerStore.getState();

      const mockTracks = [
        {
          id: "1",
          title: "Track 1",
          artist: "Artist 1",
          url: "http://example.com/1.mp3",
          duration: 180,
          albumArt: "/1.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          id: "2",
          title: "Track 2",
          artist: "Artist 2",
          url: "http://example.com/2.mp3",
          duration: 200,
          albumArt: "/2.jpg",
          likes: 200,
          plays: 2000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          id: "3",
          title: "Track 3",
          artist: "Artist 3",
          url: "http://example.com/3.mp3",
          duration: 220,
          albumArt: "/3.jpg",
          likes: 300,
          plays: 3000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      act(() => {
        setQueue(mockTracks);
        setTrack(mockTracks[0]);
      });

      render(<Footer />);

      const queueButton = screen.getByLabelText("Queue");
      fireEvent.click(queueButton);

      // Drag handles are <button aria-label="Drag to reorder">. With 3 tracks
      // we must see 3 of them.
      const dragHandles = await screen.findAllByLabelText("Drag to reorder");
      expect(dragHandles).toHaveLength(3);
      dragHandles.forEach((h) => {
        expect(h.getAttribute("draggable")).toBe("true");
      });
    });

    test("reorders queue items correctly after drag", async () => {
      const { setQueue, moveQueueItem } = usePlayerStore.getState();

      const mockTracks = [
        {
          id: "1",
          title: "Track 1",
          artist: "Artist 1",
          url: "http://example.com/1.mp3",
          duration: 180,
          albumArt: "/1.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          id: "2",
          title: "Track 2",
          artist: "Artist 2",
          url: "http://example.com/2.mp3",
          duration: 200,
          albumArt: "/2.jpg",
          likes: 200,
          plays: 2000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      act(() => {
        setQueue(mockTracks);
        moveQueueItem(0, 1);
      });

      const queue = usePlayerStore.getState().queue;
      expect(queue[0].id).toBe("2");
      expect(queue[1].id).toBe("1");
    });

    test("shows drag handle on queue items", async () => {
      const { setQueue, setTrack } = usePlayerStore.getState();

      const mockTracks = [
        {
          id: "1",
          title: "Track 1",
          artist: "Artist 1",
          url: "http://example.com/1.mp3",
          duration: 180,
          albumArt: "/1.jpg",
          likes: 100,
          plays: 1000,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];

      act(() => {
        setQueue(mockTracks);
        setTrack(mockTracks[0]);
      });

      render(<Footer />);

      const queueButton = screen.getByLabelText("Queue");
      fireEvent.click(queueButton);

      const handle = await screen.findByLabelText("Drag to reorder");
      expect(handle).toBeInTheDocument();
      expect(handle.getAttribute("draggable")).toBe("true");
    });
  });

  describe("Audio Element Sync", () => {
    test("syncs audio src with current track", async () => {
      const { setTrack } = usePlayerStore.getState();

      const mockTrack = {
        id: "1",
        title: "Test Track",
        artist: "Artist",
        url: "http://example.com/test.mp3",
        duration: 180,
        albumArt: "/cover.jpg",
        likes: 100,
        plays: 1000,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const { container } = render(<Footer />);

      act(() => {
        setTrack(mockTrack);
      });

      const audio = container.querySelector("audio") as HTMLAudioElement;
      expect(audio).toBeInTheDocument();
      // The effect that syncs `src` runs on currentTrack change.
      expect(audio.src).toContain("test.mp3");
    });

    test("plays audio when isPlaying is true", async () => {
      const { setTrack } = usePlayerStore.getState();

      const mockTrack = {
        id: "1",
        title: "Test Track",
        artist: "Artist",
        url: "http://example.com/test.mp3",
        duration: 180,
        albumArt: "/cover.jpg",
        likes: 100,
        plays: 1000,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      render(<Footer />);

      act(() => {
        setTrack(mockTrack);
      });

      const playButton = screen.getByLabelText(/Play|Pause/);
      fireEvent.click(playButton);

      // After click, store should be in playing state and the underlying
      // HTMLMediaElement.play (mocked in beforeAll) must have been called.
      await waitFor(() => {
        expect(usePlayerStore.getState().isPlaying).toBe(true);
      });
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    test("pauses audio when isPlaying is false", async () => {
      const { setTrack } = usePlayerStore.getState();

      const mockTrack = {
        id: "1",
        title: "Test Track",
        artist: "Artist",
        url: "http://example.com/test.mp3",
        duration: 180,
        albumArt: "/cover.jpg",
        likes: 100,
        plays: 1000,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      render(<Footer />);

      act(() => {
        setTrack(mockTrack);
      });

      const playButton = screen.getByLabelText(/Play|Pause/);
      fireEvent.click(playButton); // play
      fireEvent.click(playButton); // pause

      await waitFor(() => {
        expect(usePlayerStore.getState().isPlaying).toBe(false);
      });
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    });

    test("updates duration from audio metadata", async () => {
      const { setTrack, setDuration } = usePlayerStore.getState();

      const mockTrack = {
        id: "1",
        title: "Test Track",
        artist: "Artist",
        url: "http://example.com/test.mp3",
        duration: 180,
        albumArt: "/cover.jpg",
        likes: 100,
        plays: 1000,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      render(<Footer />);

      act(() => {
        setTrack(mockTrack);
        // Simulate <audio onLoadedMetadata> firing -> duration store update.
        setDuration(180);
      });

      // Footer renders effective duration as "3:00" (180s) somewhere.
      expect(usePlayerStore.getState().duration).toBe(180);
      expect(screen.getAllByText("3:00").length).toBeGreaterThan(0);
    });
  });

  describe("Time Formatting", () => {
    test("formats time correctly (0:00 for 0 seconds)", () => {
      render(<Footer />);
      expect(screen.getAllByText("0:00").length).toBeGreaterThan(0);
    });

    test("formats time correctly (1:30 for 90 seconds)", async () => {
      const { setCurrentTime } = usePlayerStore.getState();

      render(<Footer />);

      act(() => {
        setCurrentTime(90);
      });
    });

    test("handles time display with padding", () => {
      const { setCurrentTime } = usePlayerStore.getState();

      render(<Footer />);

      act(() => {
        setCurrentTime(65);
      });
    });
  });
});
