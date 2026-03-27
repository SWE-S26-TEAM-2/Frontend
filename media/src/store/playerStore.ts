import { create } from "zustand";
import type { IPlayerState } from "@/types/player.types";

export const usePlayerStore = create<IPlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  liked: false,
  shuffle: false,
  repeat: false,

  setTrack: (track) => set({ currentTrack: track, currentTime: 0, duration: 0, isPlaying: true }),
  setQueue: (tracks) => set({ queue: tracks }),
  playFromQueue: (index) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) return;
    set({ currentTrack: queue[index], currentTime: 0, duration: 0, isPlaying: true });
  },
  moveQueueItem: (fromIndex, toIndex) =>
    set((state) => {
      const length = state.queue.length;
      if (
        fromIndex < 0 ||
        fromIndex >= length ||
        toIndex < 0 ||
        toIndex >= length ||
        fromIndex === toIndex
      ) {
        return state;
      }

      const nextQueue = [...state.queue];
      const [moved] = nextQueue.splice(fromIndex, 1);
      nextQueue.splice(toIndex, 0, moved);

      return { queue: nextQueue };
    }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  toggleLike: () => set((s) => ({ liked: !s.liked })),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  toggleRepeat: () => set((s) => ({ repeat: !s.repeat })),

  playNext: () => {
    const { queue, currentTrack, shuffle } = get();
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = shuffle
      ? Math.floor(Math.random() * queue.length)
      : (idx + 1) % queue.length;
    set({ currentTrack: queue[nextIdx], currentTime: 0, duration: 0, isPlaying: true });
  },

  playPrev: () => {
    const { queue, currentTrack } = get();
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    set({ currentTrack: queue[prevIdx], currentTime: 0, duration: 0, isPlaying: true });
  },
}));
