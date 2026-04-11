import { create } from "zustand";
import type { IPlayerState } from "@/types/player.types";
import type { ITrack } from "@/types/track.types";

/**
 * Centralised helper — recomputes `liked` from the two sources of truth.
 * Used in every action that changes currentTrack or likedTrackIds.
 */
function deriveLiked(
  likedTrackIds: Set<string>,
  currentTrack: ITrack | null
): boolean {
  if (!currentTrack) return false;
  return likedTrackIds.has(currentTrack.id);
}

export const usePlayerStore = create<IPlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  likedTrackIds: new Set<string>(),
  liked: false,
  shuffle: false,
  repeat: false,

  setTrack: (track) =>
    set((s) => ({
      currentTrack: track,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
      liked: deriveLiked(s.likedTrackIds, track),
    })),
  setQueue: (tracks) =>
    set((s) => {
      // If the new queue is empty, or currentTrack is no longer in it,
      // reset currentTrack to null and liked to false.
      const stillPresent =
        s.currentTrack !== null &&
        tracks.some((t) => t.id === s.currentTrack!.id);

      if (!stillPresent) {
        return { queue: tracks, currentTrack: null, liked: false };
      }
      return { queue: tracks };
    }),
  playFromQueue: (index) => {
    const { queue, likedTrackIds } = get();
    if (index < 0 || index >= queue.length) return;
    const track = queue[index];
    set({
      currentTrack: track,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
      liked: deriveLiked(likedTrackIds, track),
    });
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
  toggleTrackLike: (trackId) =>
    set((s) => {
      const next = new Set(s.likedTrackIds);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return {
        likedTrackIds: next,
        liked: deriveLiked(next, s.currentTrack),
      };
    }),

  isTrackLiked: (trackId) => get().likedTrackIds.has(trackId),

  // Shim: Footer.tsx calls toggleLike() — routes to toggleTrackLike for currentTrack
  toggleLike: () => {
    const { currentTrack, toggleTrackLike } = get();
    if (currentTrack) toggleTrackLike(currentTrack.id);
  },
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  toggleRepeat: () => set((s) => ({ repeat: !s.repeat })),

  playNext: () => {
    const { queue, currentTrack, shuffle, repeat, likedTrackIds } = get();
    if (!queue.length || !currentTrack) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIdx: number;
    if (repeat) {
      nextIdx = idx;                                       // replay current track
    } else if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length); // random
    } else {
      nextIdx = (idx + 1) % queue.length;                 // sequential
    }
    const next = queue[nextIdx];
    set({
      currentTrack: next,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
      liked: deriveLiked(likedTrackIds, next),
    });
  },

  playPrev: () => {
    const { queue, currentTrack, currentTime, likedTrackIds } = get();
    if (!queue.length || !currentTrack) return;
    if (currentTime > 3) {
      // Restart current track — no track change, liked stays correct
      set({ currentTime: 0 });
      return;
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    const prev = queue[prevIdx];
    set({
      currentTrack: prev,
      currentTime: 0,
      duration: 0,
      isPlaying: true,
      liked: deriveLiked(likedTrackIds, prev),
    });
  },
}));
