"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "@/store/playerStore";
import { trackService } from "@/services";

import {
  PrevIcon, NextIcon, PlayIcon, PauseIcon, ShuffleIcon,
  RepeatIcon, VolumeIcon, HeartIcon, AddUserIcon, QueueIcon
} from "@/components/Icons/PlayerIcons";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TrackArtwork({
  src,
  alt,
  size,
}: {
  src?: string | null;
  alt: string;
  size: number;
}) {
  const artworkSrc = typeof src === "string" && src.trim() ? src : null;

  if (!artworkSrc) {
    return (
      <div
        className="rounded-sm bg-[#3a3a3a] shrink-0 flex items-center justify-center text-white/55"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg width={Math.round(size * 0.42)} height={Math.round(size * 0.42)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm0 13a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm0-6.5A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Z" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={artworkSrc}
      alt={alt}
      width={size}
      height={size}
      className="rounded-sm object-cover shrink-0"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
    />
  );
}

// Reusable icon button class — base (no active state)
const iconBtn =
  "bg-transparent border-none cursor-pointer text-white/80 flex items-center justify-center p-1 shrink-0 transition-colors hover:text-white";

// Icon button with active (orange) state — shuffle / repeat / like
const activeIconBtn = (active: boolean) =>
  `bg-transparent border-none cursor-pointer flex items-center justify-center p-1 shrink-0 transition-colors ${
    active ? "text-[#ff5500]" : "text-white/80 hover:text-white"
  }`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
  const router = useRouter();
  const {
    currentTrack, queue, isPlaying, currentTime, duration, volume, liked, shuffle, repeat,
    togglePlay, setCurrentTime, setDuration, setVolume, toggleLike, toggleShuffle,
    toggleRepeat, playNext, playPrev, setTrack, setQueue, playFromQueue, moveQueueItem,
  } = usePlayerStore();

  const audioRef    = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const leaveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [muted,          setMuted]          = useState(false);
  const [volVisible,     setVolVisible]     = useState(false);
  const [queueOpen,      setQueueOpen]      = useState(false);
  const [dragFromIndex,  setDragFromIndex]  = useState<number | null>(null);
  const [dragOverIndex,  setDragOverIndex]  = useState<number | null>(null);

  // Load tracks on mount
  useEffect(() => {
    if (queue.length > 0) return;
    void trackService.getAll().then((tracks) => {
      setQueue(tracks);
      if (!currentTrack && tracks.length > 0) setTrack(tracks[0]);
    }).catch(() => {});
  }, [currentTrack, queue.length, setQueue, setTrack]);

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    void (isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause());
  }, [isPlaying]);

  // Sync track source
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.url;
    audioRef.current.volume = muted ? 0 : volume;
    if (isPlaying) audioRef.current.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Sync volume / mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Allow external controls (track page waveform) to seek global audio
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    if (Math.abs(audioRef.current.currentTime - currentTime) > 0.4) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime, currentTrack]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !currentTrack) return;
    const rect  = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTo = ratio * (duration || currentTrack.duration);
    audioRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const handleVolEnter = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); setVolVisible(true); };
  const handleVolLeave = () => { leaveTimer.current = setTimeout(() => setVolVisible(false), 400); };

  const effectiveDuration = duration || currentTrack?.duration || 0;
  const progress = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration || 0); }}
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); }}
        onEnded={playNext}
      />

      {/* ── Player bar ── */}
      <footer className="fixed bottom-0 left-0 right-0 h-14 bg-[#303030] border-t border-[#505050] flex items-center px-4 gap-2.5 z-[200] overflow-hidden">

        {/* LEFT + CENTER: controls + progress */}
        <div className="flex items-center gap-2 flex-1 min-w-0">

          <button className={iconBtn} onClick={playPrev} aria-label="Previous"><PrevIcon /></button>

          {/* Play / Pause — circle button */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-[34px] h-[34px] min-w-[34px] rounded-full border border-white bg-transparent text-white cursor-pointer flex items-center justify-center shrink-0 transition-colors hover:bg-white/10 p-0"
          >
            <span className={`flex items-center justify-center ${isPlaying ? "" : "ml-0.5"}`}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </span>
          </button>

          <button className={iconBtn} onClick={playNext} aria-label="Next"><NextIcon /></button>

          <button className={activeIconBtn(shuffle)} onClick={toggleShuffle} aria-label="Shuffle"><ShuffleIcon /></button>
          <button className={activeIconBtn(repeat)}  onClick={toggleRepeat}  aria-label="Repeat"><RepeatIcon /></button>

          {/* Current time */}
          <span className="text-[#c8c8c8] text-[11px] shrink-0 min-w-[28px] text-right tabular-nums">
            {formatTime(currentTime)}
          </span>

          {/* Progress bar — width is runtime-computed, must stay inline */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="flex-1 h-1 bg-[#505050] rounded-sm cursor-pointer relative"
          >
            <div
              className="absolute inset-y-0 left-0 bg-[#ff5500] rounded-sm transition-[width] duration-500 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Duration */}
          <span className="text-[#c8c8c8] text-[11px] shrink-0 min-w-[28px] tabular-nums">
            {formatTime(effectiveDuration)}
          </span>

          {/* Volume */}
          <div
            className="flex items-center gap-1 shrink-0"
            onMouseEnter={handleVolEnter}
            onMouseLeave={handleVolLeave}
          >
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className={iconBtn}
            >
              <VolumeIcon muted={muted} />
            </button>

            {/* Animated slider: width + opacity transition via Tailwind */}
            <div className={`overflow-hidden transition-[width,opacity] duration-[250ms] ease-in-out flex items-center ${volVisible ? "w-[70px] opacity-100" : "w-0 opacity-0"}`}>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
                className="w-[70px] accent-[#ff5500] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: track info + actions */}
        {currentTrack && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => router.push(`/track/${currentTrack.id}`)}
              aria-label={`Open ${currentTrack.title}`}
              className="flex items-center gap-2.5 bg-transparent border-none p-0 text-inherit cursor-pointer"
            >
              <TrackArtwork src={currentTrack.albumArt} alt={currentTrack.title} size={38} />
              <div className="overflow-hidden max-w-[160px] text-left">
                <div className="text-white text-xs font-medium truncate">{currentTrack.title}</div>
                <div className="text-[#c8c8c8] text-[11px] truncate">{currentTrack.artist}</div>
              </div>
            </button>

            <div className="w-px h-5 bg-[#505050] shrink-0" />

            <button className={activeIconBtn(liked)} onClick={toggleLike} aria-label="Like"><HeartIcon liked={liked} /></button>
            <button className={iconBtn} aria-label="Follow"><AddUserIcon /></button>
            <button className={iconBtn} aria-label="Queue" onClick={() => setQueueOpen((p) => !p)}><QueueIcon /></button>
          </div>
        )}
      </footer>

      {/* ── Queue panel ── */}
      {queueOpen && (
        <aside className="fixed right-4 bottom-16 w-[min(420px,calc(100vw-24px))] max-h-[60vh] bg-[#121212] border border-[#505050] rounded-lg shadow-[0_10px_32px_rgba(0,0,0,0.45)] z-[250] flex flex-col overflow-hidden">

          {/* Queue header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#505050] text-white text-[13px] font-bold">
            <span>Queue ({queue.length})</span>
            <button
              onClick={() => setQueueOpen(false)}
              aria-label="Close queue"
              className="bg-transparent border-none cursor-pointer text-white/80 hover:text-white w-6 h-6 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Queue list */}
          <div className="overflow-y-auto py-1.5">
            {queue.length === 0 ? (
              <p className="text-[#999] text-xs p-3">Queue is empty.</p>
            ) : (
              queue.map((track, index) => {
                const isCurrent    = currentTrack?.id === track.id;
                const isDropTarget = dragOverIndex === index && dragFromIndex !== index;

                return (
                  <div
                    key={`${track.id}-${index}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFromIndex !== null && dragFromIndex !== index) moveQueueItem(dragFromIndex, index);
                      setDragFromIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`grid grid-cols-[26px_44px_minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-1.5 border-b border-[#282828] ${
                      isCurrent    ? "bg-[#ff5500]/10"                                 : ""
                    } ${
                      isDropTarget ? "outline outline-1 outline-[#ff5500] -outline-offset-1" : ""
                    }`}
                  >
                    {/* Track index */}
                    <span className={`text-xs text-right ${isCurrent ? "text-[#ff5500]" : "text-[#888]"}`}>
                      {index + 1}
                    </span>

                    {/* Album art */}
                    <button
                      onClick={() => playFromQueue(index)}
                      aria-label={`Play ${track.title}`}
                      className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center"
                    >
                      <TrackArtwork src={track.albumArt} alt={track.title} size={36} />
                    </button>

                    {/* Title */}
                    <button
                      onClick={() => playFromQueue(index)}
                      className={`bg-transparent border-none text-left cursor-pointer min-w-0 p-0 ${isCurrent ? "text-[#ff5500]" : "text-[#e7e7e7]"}`}
                    >
                      <div className={`text-xs truncate ${isCurrent ? "font-bold" : "font-medium"}`}>
                        {track.artist} — {track.title}
                      </div>
                    </button>

                    {/* Drag handle */}
                    <div className="flex items-center gap-1">
                      <button
                        draggable
                        onDragStart={() => setDragFromIndex(index)}
                        onDragEnd={() => { setDragFromIndex(null); setDragOverIndex(null); }}
                        aria-label="Drag to reorder"
                        className="w-7 h-[22px] bg-transparent text-white/65 border border-[#505050] rounded cursor-grab flex items-center justify-center text-xs"
                      >
                        ⠿
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </>
  );
}
