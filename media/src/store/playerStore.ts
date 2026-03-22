import { create } from "zustand";
import { ITrack } from "@/types/track.types";

interface IPlayerState  {
  currentTrack: ITrack | null;
  queue: ITrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  liked: boolean;
  shuffle: boolean;
  repeat: boolean;
  setTrack: (track: ITrack) => void;
  setQueue: (tracks: ITrack[]) => void;
  playFromQueue: (index: number) => void;
  moveQueueItem: (fromIndex: number, toIndex: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
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
