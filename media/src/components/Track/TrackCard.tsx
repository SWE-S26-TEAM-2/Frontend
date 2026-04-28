// src/components/Track/TrackCard.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { ITrackCardProps } from "@/types/track.types";
import { formatNumber } from "@/utils/formatNumber";
import { TrackCover } from "./TrackCover";
import { Waveform } from "@/components/Track/Waveform";
import { HeartIcon, ShareIcon, CopyIcon, MoreIcon, IconBtn } from "@/components/Icons/TrackIcons";
import { ShareModal } from "@/components/Share/Share";
import { seededWaveform } from "@/utils/seededWaveform";
import { usePlayerStore } from "@/store/playerStore";

export function TrackCard({ track, onPlay }: ITrackCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(track.isLiked ?? false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const shareBtnRef = useRef<HTMLSpanElement>(null);
  const moreBtnRef = useRef<HTMLSpanElement>(null);

  const { currentTrack, isPlaying, currentTime, duration, setCurrentTime, togglePlay, addToQueue } =
    usePlayerStore();

  const isCurrent = currentTrack?.id === track.id;
  const effectiveDuration = isCurrent && duration > 0 ? duration : track.duration;
  const playedPercent =
    isCurrent && effectiveDuration > 0
      ? Math.max(0, Math.min(1, currentTime / effectiveDuration))
      : 0;

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else onPlay(track);
  };

  const handleSeek = (percent: number) => {
    if (isCurrent) setCurrentTime(percent * effectiveDuration);
  };

  useEffect(() => {
    if (!isMoreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreBtnRef.current && !moreBtnRef.current.contains(e.target as Node))
        setIsMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMoreOpen]);

  const handleLikeToggle = () => setIsLiked((v) => !v);

  const handleShare = () => setIsShareOpen(true);

  const handleCopy = () => {
    if (typeof window !== "undefined")
      navigator.clipboard.writeText(`${track.artist} - ${track.title}`);
  };

  const waveform = seededWaveform(Number(track.id) || 1);

  return (
    <>
    <div className="grid grid-cols-[auto_1fr] py-3.5 border-b border-[#161616] gap-x-3.5">
      <TrackCover size={96} url={track.albumArt} alt={track.title} accentColor="#111822" />

      <div className="min-w-0">

        {/* Top row */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#888] truncate">{track.artist}</span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs text-[#555]">{track.createdAt}</span>
            {track.genre && (
              <span className="text-[11px] bg-[#1c1c1c] border border-[#2e2e2e] text-[#999] rounded px-2 py-0.5">
                # {track.genre}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-[15px] font-semibold text-white mb-2.5 truncate">{track.title}</div>

        {/* Play + Waveform + Duration */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            onClick={handlePlay}
            className="w-9 h-9 rounded-full bg-white shrink-0 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {isCurrent && isPlaying ? (
              <span className="text-[10px] font-bold text-[#111] leading-none">❚❚</span>
            ) : (
              <svg width={13} height={13} viewBox="0 0 24 24" fill="#111">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
          <Waveform data={waveform} playedPercent={playedPercent} onSeek={handleSeek} />
          <span className="text-[11px] text-[#555] shrink-0">
            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Action buttons — grid keeps icons left, stats right */}
        <div className="grid grid-cols-[auto_1fr] items-center gap-1.5">
          <div className="flex gap-1.5 items-center">
            <IconBtn
              icon={<HeartIcon isFilled={isLiked} />}
              count={isLiked ? track.likes + 1 : track.likes}
              active={isLiked}
              onClick={handleLikeToggle}
            />
            <span ref={shareBtnRef} className="inline-flex">
              <IconBtn icon={<ShareIcon />} onClick={handleShare} />
            </span>
            <IconBtn icon={<CopyIcon />} onClick={handleCopy} />
            <span ref={moreBtnRef} className="relative inline-flex">
              <IconBtn icon={<MoreIcon />} onClick={() => setIsMoreOpen((v) => !v)} />
              {isMoreOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-40 bg-[#1c1c1c] border border-[#2e2e2e] rounded shadow-lg py-1">
                  <button
                    onClick={() => { addToQueue(track); setIsMoreOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#ccc] hover:bg-[#2e2e2e] hover:text-white transition-colors cursor-pointer"
                  >
                    Add to queue
                  </button>
                </div>
              )}
            </span>
          </div>
          <div className="flex justify-end gap-3 text-[#444] text-xs">
            <span>▶ {formatNumber(track.plays)}</span>
            <span>💬 {formatNumber(track.commentsCount ?? 0)}</span>
          </div>
        </div>
      </div>
    </div>

    {isShareOpen && (
      <ShareModal
        username={`track/${track.id}`}
        mode="popover"
        anchorRef={shareBtnRef}
        onClose={() => setIsShareOpen(false)}
      />
    )}
    </>
  );
}
