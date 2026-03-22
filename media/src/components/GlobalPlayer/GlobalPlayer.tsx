"use client";

import { useRef, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";

export default function GlobalPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    setCurrentTime,
    setDuration,
  } = usePlayer();

  // ✅ ALWAYS call hooks
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black p-4 text-white flex items-center gap-4">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        autoPlay={isPlaying}
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (!audioRef.current) return;
          setDuration(audioRef.current.duration);
        }}
      />
    </div>
  );
}