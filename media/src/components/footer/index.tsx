"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePlayerStore } from "@/store/playerStore";
import { trackService } from "@/app/services";

// ── Icons ─────────────────────────────────────────────────────────────────────

const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19,5 9,12 19,19" />
    <rect x="5" y="5" width="2.5" height="14" rx="1" />
  </svg>
);
const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,5 15,12 5,19" />
    <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6,4 20,12 6,20" />
  </svg>
);
const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="4" width="4" height="16" rx="1.5" />
    <rect x="15" y="4" width="4" height="16" rx="1.5" />
  </svg>
);
const ShuffleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
  </svg>
);
const RepeatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    {!muted ? (
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    ) : (
      <>
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    )}
  </svg>
);
const HeartIcon = ({ liked }: { liked: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#FF5500" : "none"} stroke={liked ? "#FF5500" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const AddUserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const QueueIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "rgba(255,255,255,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  flexShrink: 0,
  transition: "color 0.15s",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
  const {
    currentTrack, isPlaying, currentTime, volume, liked, shuffle, repeat,
    togglePlay, setCurrentTime, setVolume, toggleLike, toggleShuffle,
    toggleRepeat, playNext, playPrev, setTrack, setQueue,
  } = usePlayerStore();

  const audioRef        = useRef<HTMLAudioElement>(null);
  const progressRef     = useRef<HTMLDivElement>(null);
  const leaveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [muted, setMuted]               = useState(false);
  const [volVisible, setVolVisible]     = useState(false);

  // Load tracks on mount
  useEffect(() => {
    trackService.getAll().then((tracks) => {
      setQueue(tracks);
      setTrack(tracks[0]);
    });
  }, []);

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
  }, [isPlaying]);

  // Sync track source
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.url;
    audioRef.current.volume = muted ? 0 : volume;
    if (isPlaying) audioRef.current.play().catch(() => {});
  }, [currentTrack]);

  // Sync volume / mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(Math.floor(audioRef.current.currentTime));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !currentTrack) return;
    const rect  = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTo = Math.floor(ratio * currentTrack.duration);
    audioRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  // Volume hover with delayed hide
  const onVolEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setVolVisible(true);
  };
  const onVolLeave = () => {
    leaveTimer.current = setTimeout(() => setVolVisible(false), 400);
  };

  const duration = currentTrack?.duration ?? 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={playNext} />

      <footer style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: "56px",
        background: "rgba(48,48,48)",
        borderTop: "1px solid rgba(80,80,80)",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: "10px",
        zIndex: 200,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        overflow: "hidden",
      }}>

        {/* ── LEFT + CENTER ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>

          <button style={iconBtn} onClick={playPrev} aria-label="Previous"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          ><PrevIcon /></button>

          <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}
            style={{
              width: "34px", height: "34px", minWidth: "34px",
              borderRadius: "50%", border: "1.5px solid #fff",
              background: "none", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.15s",
              boxSizing: "border-box", padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", marginLeft: isPlaying ? "0" : "2px" }}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </span>
          </button>

          <button style={iconBtn} onClick={playNext} aria-label="Next"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          ><NextIcon /></button>

          <button style={{ ...iconBtn, color: shuffle ? "#FF5500" : "rgba(255,255,255,0.8)" }}
            onClick={toggleShuffle} aria-label="Shuffle"
            onMouseEnter={(e) => (e.currentTarget.style.color = shuffle ? "#FF5500" : "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = shuffle ? "#FF5500" : "rgba(255,255,255,0.8)")}
          ><ShuffleIcon /></button>

          <button style={{ ...iconBtn, color: repeat ? "#FF5500" : "rgba(255,255,255,0.8)" }}
            onClick={toggleRepeat} aria-label="Repeat"
            onMouseEnter={(e) => (e.currentTarget.style.color = repeat ? "#FF5500" : "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = repeat ? "#FF5500" : "rgba(255,255,255,0.8)")}
          ><RepeatIcon /></button>

          {/* Time + progress */}
          <span style={{ color: "rgba(200,200,200)", fontSize: "11px", flexShrink: 0, minWidth: "28px", textAlign: "right" }}>
            {formatTime(currentTime)}
          </span>

          <div ref={progressRef} onClick={handleSeek} style={{
            flex: 1, height: "4px", background: "rgba(80,80,80)",
            borderRadius: "2px", cursor: "pointer", position: "relative",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${progress}%`, background: "#FF5500", borderRadius: "2px",
              transition: "width 0.5s linear",
            }} />
          </div>

          <span style={{ color: "rgba(200,200,200)", fontSize: "11px", flexShrink: 0, minWidth: "28px" }}>
            {formatTime(duration)}
          </span>

          {/* Volume — icon always shown, slider slides in on hover */}
          <div
            onMouseEnter={onVolEnter}
            onMouseLeave={onVolLeave}
            style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}
          >
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              style={iconBtn}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            >
              <VolumeIcon muted={muted} />
            </button>

            {/* Animated slider wrapper */}
            <div style={{
              width: volVisible ? "70px" : "0px",
              opacity: volVisible ? 1 : 0,
              overflow: "hidden",
              transition: "width 0.25s ease, opacity 0.25s ease",
              display: "flex",
              alignItems: "center",
            }}>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
                style={{ width: "70px", accentColor: "#FF5500", cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: track info + actions ── */}
        {currentTrack && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <Image
              src={currentTrack.albumArt} alt={currentTrack.title}
              width={38} height={38}
              style={{ borderRadius: "2px", objectFit: "cover", flexShrink: 0 }}
            />
            <div style={{ overflow: "hidden", maxWidth: "160px" }}>
              <div style={{ color: "#fff", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentTrack.title}
              </div>
              <div style={{ color: "rgba(200,200,200)", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentTrack.artist}
              </div>
            </div>

            <div style={{ width: "1px", height: "20px", background: "rgba(80,80,80)", flexShrink: 0 }} />

            <button style={{ ...iconBtn, color: liked ? "#FF5500" : "rgba(255,255,255,0.8)" }}
              onClick={toggleLike} aria-label="Like"
              onMouseEnter={(e) => (e.currentTarget.style.color = liked ? "#FF5500" : "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = liked ? "#FF5500" : "rgba(255,255,255,0.8)")}
            ><HeartIcon liked={liked} /></button>

            <button style={iconBtn} aria-label="Follow"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            ><AddUserIcon /></button>

            <button style={iconBtn} aria-label="Queue"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            ><QueueIcon /></button>
          </div>
        )}
      </footer>
    </>
  );
}