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
  const router = useRouter();
  const {
    currentTrack, queue, isPlaying, currentTime, duration, volume, liked, shuffle, repeat,
    togglePlay, setCurrentTime, setDuration, setVolume, toggleLike, toggleShuffle,
    toggleRepeat, playNext, playPrev, setTrack, setQueue, playFromQueue, moveQueueItem,
  } = usePlayerStore();

  const audioRef        = useRef<HTMLAudioElement>(null);
  const progressRef     = useRef<HTMLDivElement>(null);
  const leaveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [muted, setMuted]               = useState(false);
  const [volVisible, setVolVisible]     = useState(false);
  const [queueOpen, setQueueOpen]       = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load tracks on mount
  useEffect(() => {
    if (queue.length > 0) return;

    void trackService.getAll().then((tracks) => {
      setQueue(tracks);
      if (!currentTrack && tracks.length > 0) {
        setTrack(tracks[0]);
      }
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

  // Allow external controls (track page waveform/button) to seek global audio.
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const drift = Math.abs(audioRef.current.currentTime - currentTime);
    if (drift > 0.4) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !currentTrack) return;
    const rect  = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const effectiveDuration = duration || currentTrack.duration;
    const seekTo = ratio * effectiveDuration;
    audioRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  // Volume hover with delayed hide
  const handleVolEnter  = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setVolVisible(true);
  };
  const handleVolLeave = () => {
    leaveTimer.current = setTimeout(() => setVolVisible(false), 400);
  };

  const effectiveDuration = duration || currentTrack?.duration || 0;
  const progress = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />

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
            {formatTime(effectiveDuration)}
          </span>

          {/* Volume — icon always shown, slider slides in on hover */}
          <div
            onMouseEnter={handleVolEnter}
            onMouseLeave={handleVolLeave}
            style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}
          >
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              style={ICON_BTN}
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
            <button
              onClick={() => router.push(`/track/${currentTrack.id}`)}
              aria-label={`Open ${currentTrack.title}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "none",
                border: "none",
                padding: 0,
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <Image
                src={currentTrack.albumArt} alt={currentTrack.title}
                width={38} height={38}
                style={{ borderRadius: "2px", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ overflow: "hidden", maxWidth: "160px", textAlign: "left" }}>
              <div style={{ color: "#fff", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentTrack.title}
              </div>
              <div style={{ color: "rgba(200,200,200)", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentTrack.artist}
              </div>
              </div>
            </button>

            <div style={{ width: "1px", height: "20px", background: "rgba(80,80,80)", flexShrink: 0 }} />

            <button style={{ ...ICON_BTN , color: liked ? "#FF5500" : "rgba(255,255,255,0.8)" }}
              onClick={toggleLike} aria-label="Like"
              onMouseEnter={(e) => (e.currentTarget.style.color = liked ? "#FF5500" : "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = liked ? "#FF5500" : "rgba(255,255,255,0.8)")}
            ><HeartIcon liked={liked} /></button>

            <button style={ICON_BTN} aria-label="Follow"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            ><AddUserIcon /></button>

            <button style={ICON_BTN} aria-label="Queue"
              onClick={() => setQueueOpen((prev) => !prev)}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            ><QueueIcon /></button>
          </div>
        )}
      </footer>

      {queueOpen && (
        <aside
          style={{
            position: "fixed",
            right: 16,
            bottom: 64,
            width: "min(420px, calc(100vw - 24px))",
            maxHeight: "60vh",
            background: "#121212",
            border: "1px solid rgba(80,80,80)",
            borderRadius: "8px",
            boxShadow: "0 10px 32px rgba(0,0,0,0.45)",
            zIndex: 250,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderBottom: "1px solid rgba(80,80,80)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <span>Queue ({queue.length})</span>
            <button
              onClick={() => setQueueOpen(false)}
              style={{
                ...ICON_BTN,
                color: "rgba(255,255,255,0.8)",
                padding: 0,
                width: 24,
                height: 24,
              }}
              aria-label="Close queue"
            >
              x
            </button>
          </div>

          <div style={{ overflowY: "auto", padding: "6px 0" }}>
            {queue.length === 0 ? (
              <p style={{ color: "#999", fontSize: "12px", padding: "12px" }}>Queue is empty.</p>
            ) : (
              queue.map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const isDropTarget = dragOverIndex === index && dragFromIndex !== index;

                return (
                  <div
                    key={`${track.id}-${index}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(index);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFromIndex === null || dragFromIndex === index) return;
                      moveQueueItem(dragFromIndex, index);
                      setDragFromIndex(null);
                      setDragOverIndex(null);
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "26px 44px minmax(0,1fr) auto",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 10px",
                      borderBottom: "1px solid rgba(40,40,40)",
                      background: isCurrent ? "rgba(255,85,0,0.12)" : "transparent",
                      outline: isDropTarget ? "1px solid #FF5500" : "none",
                      outlineOffset: "-1px",
                    }}
                  >
                    <span style={{ color: isCurrent ? "#FF5500" : "#888", fontSize: "12px", textAlign: "right" }}>
                      {index + 1}
                    </span>

                    <button
                      onClick={() => playFromQueue(index)}
                      aria-label={`Play ${track.title}`}
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={track.albumArt}
                        alt={track.title}
                        width={36}
                        height={36}
                        style={{ borderRadius: "2px", objectFit: "cover" }}
                      />
                    </button>

                    <button
                      onClick={() => playFromQueue(index)}
                      style={{
                        border: "none",
                        background: "none",
                        color: isCurrent ? "#FF5500" : "#e7e7e7",
                        textAlign: "left",
                        cursor: "pointer",
                        minWidth: 0,
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: isCurrent ? 700 : 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {track.artist} - {track.title}
                      </div>
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <button
                        draggable
                        onDragStart={() => setDragFromIndex(index)}
                        onDragEnd={() => {
                          setDragFromIndex(null);
                          setDragOverIndex(null);
                        }}
                        style={{
                          ...ICON_BTN,
                          width: 28,
                          height: 22,
                          color: "rgba(255,255,255,0.65)",
                          border: "1px solid rgba(80,80,80)",
                          borderRadius: "4px",
                          cursor: "grab",
                        }}
                        aria-label="Drag to reorder"
                      >
                        |||
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