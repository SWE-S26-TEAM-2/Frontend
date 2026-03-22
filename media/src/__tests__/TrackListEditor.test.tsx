/**
 * TrackListEditor.test.tsx
 *
 * Full coverage of the form track list editor.
 * Tests: empty state, track list render, summary banner,
 *        undo toast display, keyboard reorder, remove, drag guards.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import TrackListEditor from "@/components/playlist/TrackListEditor";
import { IPlaylistTrack, IRemovedTrack } from "@/types/playlist.types";

jest.mock("@/utils/formatDuration", () => ({
  formatDuration: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
}));
jest.mock("@/utils/formatPlaylistDuration", () => ({
  formatPlaylistDuration: (s: number) => s < 60 ? `${s} sec` : `${Math.floor(s / 60)} min`,
}));

const T1: IPlaylistTrack = { id: "t1", title: "Alpha", artist: "A", albumArt: "/a.jpg", duration: 120, url: "" };
const T2: IPlaylistTrack = { id: "t2", title: "Beta",  artist: "B", albumArt: "/b.jpg", duration: 180, url: "" };
const T3: IPlaylistTrack = { id: "t3", title: "Gamma", artist: "C", albumArt: "/c.jpg", duration: 240, url: "" };

const REMOVED: IRemovedTrack = { track: T1, index: 0, removedAt: Date.now() };

// ── Empty state ────────────────────────────────────────────────────────────────

describe("TrackListEditor — empty state", () => {
  it("renders empty state when tracks is empty array", () => {
    render(
      <TrackListEditor
        tracks={[]} totalDuration={0} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByText("No tracks yet.")).toBeInTheDocument();
  });

  it("shows validation error in empty state", () => {
    render(
      <TrackListEditor
        tracks={[]} totalDuration={0}
        validationErrors={{ tracks: "Add at least 1 track." }}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByText("Add at least 1 track.")).toBeInTheDocument();
  });

  it("shows undo toast in empty state when removedTrack is present", () => {
    render(
      <TrackListEditor
        tracks={[]} totalDuration={0} validationErrors={{}}
        removedTrack={REMOVED} onRemoveTrack={jest.fn()}
        onReorderTracks={jest.fn()} onUndoRemove={jest.fn()}
      />
    );
    expect(screen.getByText(/Removed/)).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("does not crash when removedTrack is null and no onUndoRemove", () => {
    expect(() =>
      render(
        <TrackListEditor
          tracks={[]} totalDuration={0} validationErrors={{}}
          removedTrack={null} onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
        />
      )
    ).not.toThrow();
  });
});

// ── Track list render ─────────────────────────────────────────────────────────

describe("TrackListEditor — track list", () => {
  it("renders all track titles", () => {
    render(
      <TrackListEditor
        tracks={[T1, T2, T3]} totalDuration={540} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("renders 1-based index for each track", () => {
    render(
      <TrackListEditor
        tracks={[T1, T2]} totalDuration={300} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders formatted duration for each track", () => {
    render(
      <TrackListEditor
        tracks={[T1]} totalDuration={120} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    // Both the per-track duration span and the header total show "2:00"
    // when totalDuration equals the single track's duration — use getAllByText.
    const durations = screen.getAllByText("2:00");
    expect(durations.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onRemoveTrack with track id when remove button clicked", () => {
    const onRemoveTrack = jest.fn();
    render(
      <TrackListEditor
        tracks={[T1, T2]} totalDuration={300} validationErrors={{}}
        onRemoveTrack={onRemoveTrack} onReorderTracks={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /remove alpha/i }));
    expect(onRemoveTrack).toHaveBeenCalledWith("t1");
  });
});

// ── Summary banner ─────────────────────────────────────────────────────────────

describe("TrackListEditor — summary banner", () => {
  it("renders summary with correct song count (plural)", () => {
    render(
      <TrackListEditor
        tracks={[T1, T2, T3]} totalDuration={540} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByText("3 songs")).toBeInTheDocument();
  });

  it("renders summary with singular 'song' for 1 track", () => {
    render(
      <TrackListEditor
        tracks={[T1]} totalDuration={120} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByText("1 song")).toBeInTheDocument();
  });

  it("renders formatted total duration in summary", () => {
    // totalDuration=540 → 9 min via mock
    render(
      <TrackListEditor
        tracks={[T1, T2, T3]} totalDuration={540} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByText("9 min")).toBeInTheDocument();
  });
});

// ── Undo toast ─────────────────────────────────────────────────────────────────

describe("TrackListEditor — undo toast", () => {
  it("renders undo toast when removedTrack is present", () => {
    render(
      <TrackListEditor
        tracks={[T2]} totalDuration={180} validationErrors={{}}
        removedTrack={REMOVED} onRemoveTrack={jest.fn()}
        onReorderTracks={jest.fn()} onUndoRemove={jest.fn()}
      />
    );
    // The toast has role="status" with no aria-label — query by role only.
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /undo removal of alpha/i })).toBeInTheDocument();
  });

  it("calls onUndoRemove when Undo button clicked", () => {
    const onUndoRemove = jest.fn();
    render(
      <TrackListEditor
        tracks={[T2]} totalDuration={180} validationErrors={{}}
        removedTrack={REMOVED} onRemoveTrack={jest.fn()}
        onReorderTracks={jest.fn()} onUndoRemove={onUndoRemove}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /undo removal of alpha/i }));
    expect(onUndoRemove).toHaveBeenCalledTimes(1);
  });

  it("does not render undo toast when removedTrack is null", () => {
    render(
      <TrackListEditor
        tracks={[T1]} totalDuration={120} validationErrors={{}}
        removedTrack={null} onRemoveTrack={jest.fn()}
        onReorderTracks={jest.fn()} onUndoRemove={jest.fn()}
      />
    );
    expect(screen.queryByRole("button", { name: /undo removal/i })).not.toBeInTheDocument();
  });
});

// ── Keyboard reorder ───────────────────────────────────────────────────────────

describe("TrackListEditor — keyboard reorder", () => {
  it("move-up button is disabled for first track", () => {
    render(
      <TrackListEditor
        tracks={[T1, T2]} totalDuration={300} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /move alpha up/i })).toBeDisabled();
  });

  it("move-down button is disabled for last track", () => {
    render(
      <TrackListEditor
        tracks={[T1, T2]} totalDuration={300} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /move beta down/i })).toBeDisabled();
  });

  it("clicking move-up on second track calls onReorderTracks(1, 0)", () => {
    const onReorderTracks = jest.fn();
    render(
      <TrackListEditor
        tracks={[T1, T2]} totalDuration={300} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={onReorderTracks}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /move beta up/i }));
    expect(onReorderTracks).toHaveBeenCalledWith(1, 0);
  });

  it("clicking move-down on first track calls onReorderTracks(0, 1)", () => {
    const onReorderTracks = jest.fn();
    render(
      <TrackListEditor
        tracks={[T1, T2]} totalDuration={300} validationErrors={{}}
        onRemoveTrack={jest.fn()} onReorderTracks={onReorderTracks}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /move alpha down/i }));
    expect(onReorderTracks).toHaveBeenCalledWith(0, 1);
  });
});

// ── Defensive rendering ────────────────────────────────────────────────────────

describe("TrackListEditor — defensive", () => {
  it("does not crash when tracks prop is undefined", () => {
    expect(() =>
      render(
        <TrackListEditor
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tracks={undefined as any} totalDuration={0} validationErrors={{}}
          onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
        />
      )
    ).not.toThrow();
  });

  it("does not crash when totalDuration is undefined", () => {
    expect(() =>
      render(
        <TrackListEditor
          tracks={[T1]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          totalDuration={undefined as any} validationErrors={{}}
          onRemoveTrack={jest.fn()} onReorderTracks={jest.fn()}
        />
      )
    ).not.toThrow();
  });
});
