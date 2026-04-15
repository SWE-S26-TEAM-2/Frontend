import type { ITrack } from "@/types/track.types";

export interface IPlayerState {
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
