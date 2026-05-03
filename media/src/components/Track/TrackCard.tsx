// src/components/Track/TrackCard.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { ITrackCardProps } from "@/types/track.types";
import { formatNumber } from "@/utils/formatNumber";
import { TrackCover } from "./TrackCover";
import { Waveform } from "@/components/Track/Waveform";
import { HeartIcon, ShareIcon, CopyIcon, MoreIcon, IconBtn, RepostIcon } from "@/components/Icons/TrackIcons";
import { ShareModal } from "@/components/Share/Share";
import { useWaveform } from "@/hooks/useWaveform";
import { usePlayerStore } from "@/store/playerStore";
import { studioService } from "@/services/di";
import { realTrackService } from "@/services/api/trackService";
import { useInitTrackEngagement, useTrackEngagement } from "@/hooks/useTrackEngagement";

export function TrackCard({ track, onPlay, onLikeChange, isOwner, onDelete }: ITrackCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>(track.albumArt ?? "");
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const shareBtnRef = useRef<HTMLSpanElement>(null);
  const moreBtnRef = useRef<HTMLSpanElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useInitTrackEngagement(track);
  const { isLiked, likes, isReposted, reposts, toggleLike, toggleRepost } =
    useTrackEngagement(track.id);

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
    else {
      onPlay(track);
      realTrackService.postTrack(track.id);
    }
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


  const handleShare = () => setIsShareOpen(true);

  const handleCopy = () => {
    if (typeof window !== "undefined")
      navigator.clipboard.writeText(`${track.artist} - ${track.title}`);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await studioService.deleteTrack(track.id);
      onDelete?.(track.id);
    } catch (err) {
      console.error("[TrackCard] delete failed:", err);
      setDeleteConfirming(false);
    } finally {
      setIsDeleting(false);
      setIsMoreOpen(false);
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCoverUrl(preview);
    setIsUploadingCover(true);
    try {
      const newUrl = await studioService.updateTrackCover(track.id, file);
      if (newUrl) setCoverUrl(newUrl);
    } catch {
      setCoverUrl(track.albumArt ?? "");
    } finally {
      setIsUploadingCover(false);
      URL.revokeObjectURL(preview);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const waveform = useWaveform(track.id);

  return (
    <>
    <div
      className="grid grid-cols-[auto_1fr] py-3.5 border-b border-[#161616] gap-x-3.5"
      data-testid="track-card"
    >
      <div className="relative shrink-0 group">
        <TrackCover size={96} url={coverUrl || track.albumArt} alt={track.title} accentColor="#111822" />
        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="absolute inset-0 flex items-center justify-center rounded-sm bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
              aria-label="Change track cover"
            >
              {isUploadingCover ? (
                <svg className="animate-spin" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverFileChange}
            />
          </>
        )}
      </div>

      <div className="min-w-0">
        {/* Top row */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#888] truncate">{track.artist}</span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs text-[#555]">
              {track.createdAt
                ? new Date(track.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </span>
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
          <button
            type="button"
            onClick={handlePlay}
            aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
            className="w-9 h-9 rounded-full bg-white shrink-0 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-none p-0"
          >
            {isCurrent && isPlaying ? (
              <span className="text-[10px] font-bold text-[#111] leading-none">❚❚</span>
            ) : (
              <svg width={13} height={13} viewBox="0 0 24 24" fill="#111">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <Waveform data={waveform} playedPercent={playedPercent} onSeek={handleSeek} />
          <span className="text-[11px] text-[#555] shrink-0">
            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-[auto_1fr] items-center gap-1.5">
          <div className="flex gap-1.5 items-center">
            <IconBtn
              icon={<HeartIcon isFilled={isLiked} />}
              count={likes}
              active={isLiked}
              ariaLabel="Like track"
              onClick={toggleLike}
            />
            <IconBtn
              icon={<RepostIcon />}
              count={reposts}
              active={isReposted}
              onClick={toggleRepost}
            />
            <span ref={shareBtnRef} className="inline-flex">
              <IconBtn icon={<ShareIcon />} onClick={handleShare} />
            </span>
            <IconBtn icon={<CopyIcon />} onClick={handleCopy} />
            <span ref={moreBtnRef} className="relative inline-flex">
              <IconBtn
                icon={<MoreIcon />}
                ariaLabel="More options"
                onClick={() => setIsMoreOpen((v) => !v)}
              />
              {isMoreOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 min-w-40 bg-[#1c1c1c] border border-[#2e2e2e] rounded shadow-lg py-1">
                  <button
                    onClick={() => { addToQueue(track); setIsMoreOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-[#ccc] hover:bg-[#2e2e2e] hover:text-white transition-colors cursor-pointer"
                  >
                    Add to queue
                  </button>
                  {isOwner && !deleteConfirming && (
                    <button
                      onClick={() => setDeleteConfirming(true)}
                      className="w-full text-left px-3 py-2 text-xs text-[#ff5555] hover:bg-[#2e2e2e] transition-colors cursor-pointer"
                    >
                      Delete track
                    </button>
                  )}
                  {isOwner && deleteConfirming && (
                    <>
                      <button
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="w-full text-left px-3 py-2 text-xs text-[#ff5555] font-semibold hover:bg-[#2e2e2e] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? "Deleting…" : "Confirm delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirming(false)}
                        className="w-full text-left px-3 py-2 text-xs text-[#999] hover:bg-[#2e2e2e] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
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
