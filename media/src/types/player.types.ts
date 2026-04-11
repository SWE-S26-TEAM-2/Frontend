import type { ITrack } from "@/types/track.types";

export interface IPlayerState {
  currentTrack: ITrack | null;
  queue: ITrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  /** Per-track like set — source of truth */
  likedTrackIds: Set<string>;
  /**
   * Derived boolean — true when currentTrack is in likedTrackIds.
   * Kept for backward compatibility: Footer.tsx reads this directly.
   */
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
  /** Toggle like state for a specific track by id */
  toggleTrackLike: (trackId: string) => void;
  /** Returns true if the given trackId is liked */
  isTrackLiked: (trackId: string) => boolean;
  /** Shim: toggles like for currentTrack — preserves Footer.tsx call site */
  toggleLike: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrev: () => void;
}
