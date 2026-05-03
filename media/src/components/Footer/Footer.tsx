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
    toggleRepeat, playNext, playPrev, setTrack, setQueue, addToQueue, playFromQueue, moveQueueItem,
  } = usePlayerStore();

  const audioRef    = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const leaveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [muted,           setMuted]           = useState(false);
  const [volVisible,      setVolVisible]      = useState(false);
  const [queueOpen,       setQueueOpen]       = useState(false);
  const [dragFromIndex,   setDragFromIndex]   = useState<number | null>(null);
  const [dragOverIndex,   setDragOverIndex]   = useState<number | null>(null);
  const [stationsEnabled, setStationsEnabled] = useState(false);

  const fetchStationTracks = async (trackId: string) => {
    try {
      const related = await trackService.getRelated(trackId);
      if (related.length === 0) {
        console.warn("[stations] No related tracks found for autoplay.");
        return;
      }
      related.forEach((t) => addToQueue(t));
    } catch {
      console.warn("[stations] fetchStationTracks: endpoint unavailable.");
    }
  };

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
    onEnded={() => {
      if (stationsEnabled && currentTrack) void fetchStationTracks(currentTrack.id);
      playNext();
    }}
  />

  {/* ── Player bar ── */}
  <footer className="fixed bottom-0 left-0 right-0 h-[48px] bg-[var(--sc-footer-bg)] border-t border-[var(--sc-border)] flex items-center px-2 gap-2 z-[200] overflow-hidden text-[12px]">

    {/* LEFT */}
    <div className="flex items-center gap-1 shrink-0">
      <button aria-label="Previous" className={`${iconBtn} hidden sm:flex`} onClick={playPrev}><PrevIcon /></button>

      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={togglePlay}
        className="w-8 h-8 min-w-[32px] rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:bg-[#e5e5e5]"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <button aria-label="Next" className={`${iconBtn} hidden sm:flex`} onClick={playNext}><NextIcon /></button>
      <button aria-label="Shuffle" className={`${activeIconBtn(shuffle)} hidden md:flex`} onClick={toggleShuffle}><ShuffleIcon /></button>
      <button aria-label="Repeat" className={`${activeIconBtn(repeat)} hidden md:flex`} onClick={toggleRepeat}><RepeatIcon /></button>
    </div>

    {/* CENTER */}
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="text-[#ccc] text-[11px] hidden sm:block min-w-[28px] text-right">
        {formatTime(currentTime)}
      </span>

      <div
        ref={progressRef}
        onClick={handleSeek}
        className="flex-1 h-[2px] bg-[#555] relative cursor-pointer"
      >
        <div
          className="absolute top-0 left-0 h-[2px] bg-[#f50]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-[#ccc] text-[11px] hidden sm:block min-w-[28px]">
        {formatTime(effectiveDuration)}
      </span>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-1 shrink-0">

      {/* Volume */}
      <div
        className="hidden md:flex items-center gap-1"
        onMouseEnter={handleVolEnter}
        onMouseLeave={handleVolLeave}
      >
        <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className={iconBtn}>
          <VolumeIcon muted={muted} />
        </button>

        <div className={`overflow-hidden transition-all duration-200 ${volVisible ? "w-[70px] opacity-100" : "w-0 opacity-0"}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
            className="w-[70px] accent-[#f50]"
          />
        </div>
      </div>

      {currentTrack && (
        <>
          <div className="w-px h-4 bg-[#555] hidden md:block" />

          <button
            onClick={() => router.push(`/track/${currentTrack.id}`)}
            className="flex items-center gap-2 min-w-0"
          >
            <TrackArtwork src={currentTrack.albumArt} alt={currentTrack.title} size={32} />

            <div className="max-w-[140px] overflow-hidden">
              <div className="text-[#ccc] text-[11px] truncate">
                {currentTrack.artist}
              </div>
              <div className="text-white text-[12px] truncate">
                {currentTrack.title}
              </div>
            </div>
          </button>

          <div className="w-px h-4 bg-[#555] hidden sm:block" />

          <button className={activeIconBtn(liked)} onClick={toggleLike}>
            <HeartIcon liked={liked} />
          </button>

          <button className={`${iconBtn} hidden sm:flex`}>
            <AddUserIcon />
          </button>

          <button aria-label="Queue" className={iconBtn} onClick={() => setQueueOpen((p) => !p)}>
            <QueueIcon />
          </button>
        </>
      )}
    </div>
  </footer>

  {/* ── Queue panel ── */}
  {queueOpen && (
    <aside className="fixed right-2 bottom-[48px] w-[360px] max-h-[65vh] bg-[#111] border border-[#333] rounded-md shadow-xl z-[250] flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] text-white text-sm font-semibold">
        <span>Next up</span>
        <button onClick={() => setQueueOpen(false)} className="text-[#aaa] hover:text-white">✕</button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {queue.map((track, index) => {
          const isCurrent = currentTrack?.id === track.id;

          return (
            <div
              key={`${track.id}-${index}`}
              draggable
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer select-none ${
                isCurrent
                  ? "bg-[#2a2a2a]"
                  : dragOverIndex === index && dragFromIndex !== index
                  ? "bg-[#1e2a3a] border-l-2 border-[#f50]"
                  : "hover:bg-[#1a1a1a]"
              }`}
              onClick={() => playFromQueue(index)}
              onDragStart={() => setDragFromIndex(index)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
              onDrop={() => {
                if (dragFromIndex !== null && dragFromIndex !== index) moveQueueItem(dragFromIndex, index);
                setDragFromIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => { setDragFromIndex(null); setDragOverIndex(null); }}
            >
              <TrackArtwork src={track.albumArt} alt={track.title} size={40} />

              <div className="flex-1 min-w-0">
                <div className="text-xs text-[#aaa] truncate">{track.artist}</div>
                <div className="text-sm text-white truncate">{track.title}</div>
              </div>

              <span className="text-xs text-[#888]">
                {formatTime(track.duration)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-[#222] p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white text-sm">Autoplay station</div>
            <div className="text-xs text-[#aaa]">
              Hear related tracks based on what&apos;s playing now.
            </div>
          </div>

          <button
            onClick={() => setStationsEnabled((p) => !p)}
            className={`w-10 h-5 rounded-full relative transition-colors ${stationsEnabled ? "bg-[#f50]" : "bg-[#555]"}`}
            aria-label="Toggle autoplay station"
          >
            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full transition-all ${stationsEnabled ? "right-1" : "left-1"}`} />
          </button>
        </div>
      </div>

    </aside>
  )}
</>
  );
}
