/**
 * @file store/playerStore.ts
 * @description Global audio player state — Zustand store.
 *
 * SHARED ACROSS ALL TEAMS:
 * This store is the single source of truth for playback state.
 * Any feature that needs to trigger playback (playlist page, track cards,
 * search results, etc.) should call setTrack / setQueue from this store.
 *
 * TRACK SHAPE REQUIREMENT:
 * Tracks passed to setTrack / setQueue MUST have:
 *   - albumArt: string
 *   - url: string
 *
 * Tier 1 change:
 *   liked: boolean  →  likedTrackIds: Set<string>
 *   Replaces the single global like flag with a per-track Set.
 *   toggleTrackLike(id) adds/removes the id from the Set.
 *   isTrackLiked(id)    returns true if the id is in the Set.
 *   The old toggleLike() is kept as a shim that toggles the current track,
 *   so existing callers continue to work without changes.
 */

import { create } from "zustand";
import { ITrack } from "@/types/track.types";

interface IPlayerState {
  currentTrack: ITrack | null;
  queue: ITrack[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  /** Per-track like state — replaces the old single `liked` boolean */
  likedTrackIds: Set<string>;
  shuffle: boolean;
  repeat: boolean;

  setTrack: (track: ITrack) => void;
  setQueue: (tracks: ITrack[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  /** Toggle like for a specific track id */
  toggleTrackLike: (trackId: string) => void;
  /** Returns true if the given track id is liked */
  isTrackLiked: (trackId: string) => boolean;
  /**
   * Convenience shim — toggles the like state of the currently playing track.
   * Keeps Footer and any other caller that used toggleLike() working unchanged.
   */
  toggleLike: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrev: () => void;
}

export const usePlayerStore = create<IPlayerState>((set, get) => ({
  currentTrack:  null,
  queue:         [],
  isPlaying:     false,
  currentTime:   0,
  volume:        0.8,
  likedTrackIds: new Set<string>(),
  shuffle:       false,
  repeat:        false,

  setTrack: (track) =>
    set({ currentTrack: track, currentTime: 0, isPlaying: true }),

  setQueue: (tracks) => set({ queue: tracks }),

  play:  () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setCurrentTime: (time) => set({ currentTime: time }),

  setVolume: (volume) => set({ volume }),

  toggleTrackLike: (trackId: string) =>
    set((s) => {
      const next = new Set(s.likedTrackIds);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return { likedTrackIds: next };
    }),

  isTrackLiked: (trackId: string) => get().likedTrackIds.has(trackId),

  // Shim: toggles the current track — keeps Footer working with one call
  toggleLike: () => {
    const { currentTrack, toggleTrackLike } = get();
    if (currentTrack) toggleTrackLike(currentTrack.id);
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat:  () => set((s) => ({ repeat: !s.repeat })),

  playNext: () => {
    const { queue, currentTrack, shuffle, repeat } = get();
    if (!queue.length || !currentTrack) return;

    const idx = queue.findIndex((t) => t.id === currentTrack.id);

    let nextIdx: number;
    if (repeat) {
      nextIdx = idx;
    } else if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (idx + 1) % queue.length;
    }

    set({ currentTrack: queue[nextIdx], currentTime: 0, isPlaying: true });
  },

  playPrev: () => {
    const { queue, currentTrack, currentTime } = get();
    if (!queue.length || !currentTrack) return;

    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const idx     = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;

    set({ currentTrack: queue[prevIdx], currentTime: 0, isPlaying: true });
  },
}));
