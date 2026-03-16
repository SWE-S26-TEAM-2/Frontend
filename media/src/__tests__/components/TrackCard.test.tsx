// src/__tests__/components/TrackCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackCard } from "@/components/Track/TrackCard";
import { type Track } from "@/services/userProfile.service";

// Sample track matching the Track type exactly
const sampleTrack: Track = {
  id: 1,
  title: "Une vie à t'aimer",
  artist: "Lorien Testard, Alice Duport-Percier, Victor Borba",
  repostedBy: "test00user",
  createdAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
  genre: "Soundtrack",
  likes: 5140,
  reposts: 70,
  plays: 312000,
  comments: 99,
  duration: "11:00",
  coverUrl: null,
  waveform: Array(80).fill(0.5),
  playedPercent: 0.28,
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
    expect(screen.getByText(sampleTrack.duration)).toBeInTheDocument();
  });

  it("renders genre tag when genre is provided", () => {
    render(<TrackCard track={sampleTrack} onPlay={onPlay}/>);
    expect(screen.getByText(/Soundtrack/)).toBeInTheDocument();
  });

  it("does not render genre tag when genre is null", () => {
    render(<TrackCard track={{ ...sampleTrack, genre: null }} onPlay={onPlay}/>);
    expect(screen.queryByText(/#/)).not.toBeInTheDocument();
  });

  it("renders repostedBy when provided", () => {
    render(<TrackCard track={sampleTrack} onPlay={onPlay}/>);
    expect(screen.getByText("test00user")).toBeInTheDocument();
  });

  it("does not render repost info when repostedBy is null", () => {
    render(<TrackCard track={{ ...sampleTrack, repostedBy: null }} onPlay={onPlay}/>);
    expect(screen.queryByText("↻")).not.toBeInTheDocument();
  });

  it("toggles like state when like button is clicked", () => {
    render(<TrackCard track={{ ...sampleTrack, isLiked: false }} onPlay={onPlay}/>);
    const likeBtn = screen.getAllByRole("button")[0];
    fireEvent.click(likeBtn);
    expect(screen.getByText("5.1K")).toBeInTheDocument();
  });
});