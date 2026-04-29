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
 */

/**
 * BACKEND INTEGRATION:
 * When real API data arrives, ensure the API response is mapped to the
 * Track interface before calling setTrack. Do the mapping in the service
 * layer (services/api/*.ts), not here or in components.
 */

import { create } from "zustand";
import { ITrack } from "@/types/track.types"; 

interface IPlayerState {
  currentTrack: ITrack | null;
  queue: ITrack[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  liked: boolean;
  shuffle: boolean;
  repeat: boolean;

  setTrack: (track: ITrack) => void;
  setQueue: (tracks: ITrack[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLike: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrev: () => void;
}

export const usePlayerStore = create<IPlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  volume: 0.8,
  liked: false,
  shuffle: false,
  repeat: false,

  setTrack: (track) =>
    set({ currentTrack: track, currentTime: 0, isPlaying: true }),

  setQueue: (tracks) => set({ queue: tracks }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setCurrentTime: (time) => set({ currentTime: time }),

  setVolume: (volume) => set({ volume }),

  toggleLike: () => set((s) => ({ liked: !s.liked })),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () => set((s) => ({ repeat: !s.repeat })),

  playNext: () => {
    const { queue, currentTrack, shuffle, repeat } = get();
    if (!queue.length || !currentTrack) return;

    const idx = queue.findIndex((t) => t.id === currentTrack.id);

    let nextIdx: number;
    if (repeat) {
      nextIdx = idx; // 🔁 repeat current track
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

    // If more than 3 seconds in, restart current track instead of going prev
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;

    set({ currentTrack: queue[prevIdx], currentTime: 0, isPlaying: true });
  },
}));