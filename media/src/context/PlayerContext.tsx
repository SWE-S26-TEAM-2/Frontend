"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ITrack } from "@/types/track.types";

interface IPlayerContextValue {
  currentTrack: ITrack | null;
  isPlaying: boolean;
  playTrack: (track: ITrack) => void;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
}

const PlayerContext = createContext<IPlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<ITrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playTrack = (track: ITrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      playTrack,
      togglePlay,
      currentTime,
      duration,
      setCurrentTime,
      setDuration,
    }),
    [currentTrack, isPlaying, currentTime, duration, setCurrentTime, setDuration]
  );
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): IPlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}