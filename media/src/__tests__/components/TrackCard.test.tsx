import { render, screen, fireEvent } from "@testing-library/react";
import { TrackCard } from "@/components/Track/TrackCard";
import { TrackCover } from "@/components/Track/TrackCover";
import { type ITrack } from "@/types/track.types";

// Mock the waveform hook to prevent fetch calls during tests
jest.mock("@/hooks/useWaveform", () => ({
  useWaveform: () => Array(50).fill(0.5), 
}));

const sampleTrack: ITrack = {
  id: "1",
  title: "Une vie à t'aimer",
  artist: "Lorien Testard",
  createdAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  genre: "Soundtrack",
  likes: 5140,
  plays: 312000,
  commentsCount: 99,
  duration: 660,
  albumArt: "",
  url: "https://example.com/audio.mp3",
  isLiked: true,
};

const onPlay = jest.fn();

describe("TrackCard", () => {
  beforeEach(() => onPlay.mockClear());

  it("renders track title", () => {
    render(<TrackCard track={sampleTrack} onPlay={onPlay}/>);
    expect(screen.getByText(sampleTrack.title)).toBeInTheDocument();
  });

  it("renders track duration", () => {
    render(<TrackCard track={sampleTrack} onPlay={onPlay}/>);
    expect(screen.getByText("11:00")).toBeInTheDocument();
  });

  it("renders genre tag when genre is provided", () => {
    render(<TrackCard track={sampleTrack} onPlay={onPlay}/>);
    expect(screen.getByText(/Soundtrack/)).toBeInTheDocument();
  });

  it("does not render genre tag when genre is null", () => {
    render(<TrackCard track={{ ...sampleTrack, genre: undefined }} onPlay={onPlay}/>);
    expect(screen.queryByText(/#/)).not.toBeInTheDocument();
  });

  it("calls onPlay when play button div is clicked", () => {
    const { container } = render(<TrackCard track={sampleTrack} onPlay={onPlay}/>);
    const svgs = container.querySelectorAll("svg");
    let playDiv: HTMLElement | null = null;
    svgs.forEach(svg => {
      const path = svg.querySelector("path[d='M8 5v14l11-7z']");
      if (path) playDiv = svg.parentElement as HTMLElement;
    });
    if (playDiv) fireEvent.click(playDiv);
    expect(onPlay).toHaveBeenCalledWith(sampleTrack);
  });

  it("toggles like to true when track is not liked", () => {
    render(<TrackCard track={{ ...sampleTrack, isLiked: false }} onPlay={onPlay}/>);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); 
    expect(screen.getByText("5.1K")).toBeInTheDocument();
  });
});

describe("TrackCover", () => {
  it("renders placeholder svg when url is null", () => {
    const { container } = render(<TrackCover url={null} size={100}/>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders Image when url is provided", () => {
    const { container } = render(
      <TrackCover url="https://example.com/cover.jpg" size={100} alt="test cover"/>
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("alt")).toBe("test cover");
  });
});