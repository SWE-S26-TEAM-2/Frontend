"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

const ICON_BTN: React.CSSProperties = {
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
    currentTrack, isPlaying, currentTime, volume,
    likedTrackIds, shuffle, repeat,
    togglePlay, setCurrentTime, setVolume, toggleLike,
    toggleShuffle, toggleRepeat, playNext, playPrev, setTrack, setQueue,
  } = usePlayerStore();

  // Per-track liked state derived from the Set — recalculates when
  // currentTrack or likedTrackIds changes.
  const isLiked = currentTrack ? likedTrackIds.has(currentTrack.id) : false;

  const audioRef    = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const leaveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Boolean state — correctly prefixed per naming convention
  const [isMuted, setIsMuted]         = useState(false);
  const [isVolVisible, setIsVolVisible] = useState(false);

  // Load tracks on mount
  useEffect(() => {
    void trackService.getAll().then((tracks) => {
      setQueue(tracks);
      setTrack(tracks[0]);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    void (isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause());
  }, [isPlaying]);

  // Sync track source
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    audioRef.current.src = currentTrack.url;
    audioRef.current.volume = isMuted ? 0 : volume;
    if (isPlaying) audioRef.current.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Sync volume / mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(Math.floor(audioRef.current.currentTime));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !currentTrack) return;
    const rect   = progressRef.current.getBoundingClientRect();
    const ratio  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTo = Math.floor(ratio * currentTrack.duration);
    audioRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  // Volume hover with delayed hide
  const handleVolEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setIsVolVisible(true);
  };
  const handleVolLeave = () => {
    leaveTimer.current = setTimeout(() => setIsVolVisible(false), 400);
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

          <button style={ICON_BTN} onClick={playPrev} aria-label="Previous"
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

          <button style={ICON_BTN} onClick={playNext} aria-label="Next"
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          ><NextIcon /></button>

          <button style={{ ...ICON_BTN, color: shuffle ? "#FF5500" : "rgba(255,255,255,0.8)" }}
            onClick={toggleShuffle} aria-label="Shuffle"
            onMouseEnter={(e) => (e.currentTarget.style.color = shuffle ? "#FF5500" : "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = shuffle ? "#FF5500" : "rgba(255,255,255,0.8)")}
          ><ShuffleIcon /></button>

          <button style={{ ...ICON_BTN, color: repeat ? "#FF5500" : "rgba(255,255,255,0.8)" }}
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
            onMouseEnter={handleVolEnter}
            onMouseLeave={handleVolLeave}
            style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}
          >
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              aria-label={isMuted ? "Unmute" : "Mute"}
              style={ICON_BTN}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            >
              <VolumeIcon muted={isMuted} />
            </button>

            {/* Animated slider wrapper */}
            <div style={{
              width: isVolVisible ? "70px" : "0px",
              opacity: isVolVisible ? 1 : 0,
              overflow: "hidden",
              transition: "width 0.25s ease, opacity 0.25s ease",
              display: "flex",
              alignItems: "center",
            }}>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
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

            <button style={{ ...ICON_BTN, color: isLiked ? "#FF5500" : "rgba(255,255,255,0.8)" }}
              onClick={toggleLike} aria-label={isLiked ? "Unlike" : "Like"}
              onMouseEnter={(e) => (e.currentTarget.style.color = isLiked ? "#FF5500" : "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = isLiked ? "#FF5500" : "rgba(255,255,255,0.8)")}
            ><HeartIcon liked={isLiked} /></button>

            <button style={ICON_BTN} aria-label="Follow"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            ><AddUserIcon /></button>

            <button style={ICON_BTN} aria-label="Queue"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            ><QueueIcon /></button>
          </div>
        )}
      </footer>
    </>
  );
}
