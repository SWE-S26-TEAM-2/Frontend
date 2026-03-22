// src/__tests__/components/TrackCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackCard } from "@/components/Track/TrackCard";
import { TrackCover } from "@/components/Track/TrackCover";
import { type ITrack } from "@/types/track.types";

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
    // The play button is a div with onClick — find it by its SVG play path inside
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
    fireEvent.click(buttons[0]); // like button is first action button
    // likes count should increment by 1
    expect(screen.getByText("5.1K")).toBeInTheDocument();
  });

  it("toggles like to false when track is already liked", () => {
    render(<TrackCard track={{ ...sampleTrack, isLiked: true }} onPlay={onPlay}/>);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    // likes count should go back to original
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
    // Next.js Image renders as img tag in test environment
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("alt")).toBe("test cover");
  });

  it("renders with correct size", () => {
    const { container } = render(<TrackCover url={null} size={44}/>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe("44px");
    expect(div.style.height).toBe("44px");
  });

  it("renders with custom accentColor in background", () => {
    const { container } = render(<TrackCover url={null} size={100} accentColor="#ff0000"/>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toContain("#ff0000");
  });

  it("renders transparent background when url is provided", () => {
    const { container } = render(
      <TrackCover url="https://example.com/cover.jpg" size={100}/>
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toBe("transparent");
  });
});