/**
 * PlaylistTrackItem.test.tsx
 */

import { render, screen, fireEvent } from "@testing-library/react";
import PlaylistTrackItem from "@/components/playlist/PlaylistTrackItem";
import { IPlaylistTrack } from "@/types/playlist.types";

// ── Mock usePlayerStore ────────────────────────────────────────
const mockSetQueue   = jest.fn();
const mockSetTrack   = jest.fn();
const mockTogglePlay = jest.fn();

let mockCurrentTrackId: string | null = null;
let mockIsPlaying = false;

jest.mock("@/store/playerStore", () => ({
  usePlayerStore: (selector: (s: object) => unknown) =>
    selector({
      currentTrack: mockCurrentTrackId ? { id: mockCurrentTrackId } : null,
      isPlaying: mockIsPlaying,
      setQueue: mockSetQueue,
      setTrack: mockSetTrack,
      togglePlay: mockTogglePlay,
    }),
}));

// ── Fixtures ───────────────────────────────────────────────────
const TRACK: IPlaylistTrack = {
  id: "t1",
  title: "Neon Drift",
  artist: "HΛLOGEN",
  albumArt: "/covers/song1.jpg",
  duration: 214,
};

const ALL_TRACKS: IPlaylistTrack[] = [TRACK];

// ── Tests ──────────────────────────────────────────────────────
describe("PlaylistTrackItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentTrackId = null;
    mockIsPlaying = false;
  });

  it("renders track title", () => {
    render(<PlaylistTrackItem track={TRACK} index={1} allTracks={ALL_TRACKS} />);
    expect(screen.getByText("Neon Drift")).toBeInTheDocument();
  });

  it("renders artist name", () => {
    render(<PlaylistTrackItem track={TRACK} index={1} allTracks={ALL_TRACKS} />);
    expect(screen.getByText("HΛLOGEN")).toBeInTheDocument();
  });

  it("renders formatted duration", () => {
    render(<PlaylistTrackItem track={TRACK} index={1} allTracks={ALL_TRACKS} />);
    expect(screen.getByText("3:34")).toBeInTheDocument();
  });

  it("renders index number when not hovered and not active", () => {
    render(<PlaylistTrackItem track={TRACK} index={3} allTracks={ALL_TRACKS} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls setQueue and setTrack when play button clicked on inactive track", () => {
    const { container } = render(
      <PlaylistTrackItem track={TRACK} index={1} allTracks={ALL_TRACKS} />
    );
    fireEvent.mouseEnter(container.querySelector("li")!);
    fireEvent.click(screen.getByRole("button", { name: /play neon drift/i }));
    expect(mockSetQueue).toHaveBeenCalledTimes(1);
    expect(mockSetTrack).toHaveBeenCalledTimes(1);
  });

  it("calls togglePlay when clicking the active track", () => {
    mockCurrentTrackId = "t1";
    mockIsPlaying = true;
    render(<PlaylistTrackItem track={TRACK} index={1} allTracks={ALL_TRACKS} />);
    fireEvent.click(screen.getByRole("button", { name: /pause neon drift/i }));
    expect(mockTogglePlay).toHaveBeenCalledTimes(1);
    expect(mockSetTrack).not.toHaveBeenCalled();
  });

  it("does not render remove button when onRemove is not provided", () => {
    const { container } = render(
      <PlaylistTrackItem track={TRACK} index={1} allTracks={ALL_TRACKS} />
    );
    fireEvent.mouseEnter(container.querySelector("li")!);
    expect(screen.queryByRole("button", { name: /remove neon drift/i })).not.toBeInTheDocument();
  });

  it("calls onRemove with track id when remove button is clicked", () => {
    const handleRemove = jest.fn();
    const { container } = render(
      <PlaylistTrackItem
        track={TRACK}
        index={1}
        allTracks={ALL_TRACKS}
        onRemove={handleRemove}
      />
    );
    fireEvent.mouseEnter(container.querySelector("li")!);
    fireEvent.click(screen.getByRole("button", { name: /remove neon drift/i }));
    expect(handleRemove).toHaveBeenCalledWith("t1");
  });
});
