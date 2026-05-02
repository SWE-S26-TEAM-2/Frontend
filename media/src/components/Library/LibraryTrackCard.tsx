"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { formatNumber } from "@/utils/formatNumber";
import { Waveform } from "@/components/Track/Waveform";
import { HeartIcon, RepostIcon, ShareIcon, CopyIcon, MoreIcon } from "@/components/Icons/TrackIcons";
import { CoverBox } from "@/components/Library/CoverBox";
import { ShareModal } from "@/components/Share/Share";
import type { ILibraryTrack } from "@/types/library.types";
import { engagementService, commentService } from "@/services/di";
import { useWaveform } from "@/hooks/useWaveform";
import { usePlayerStore } from "@/store/playerStore";

interface ITrackListRowProps {
  track: ILibraryTrack;
  allTracks?: ILibraryTrack[];
}

export function TrackListRow({ track, allTracks = [] }: ITrackListRowProps) {
  const [commentText, setCommentText] = useState("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const waveform = useWaveform(track.id);
  const moreBtnRef = useRef<HTMLSpanElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const [userInitial] = useState<string>(() => {
    const username = window.localStorage.getItem("auth_username") ?? "";
    return username.charAt(0).toUpperCase() || "?";
  });
  const [nowMs] = useState<number>(() => Date.now());

  const { currentTrack, isPlaying, currentTime, duration, setCurrentTime, togglePlay, setTrack, setQueue, addToQueue } = usePlayerStore();

  const isCurrent = currentTrack?.id === track.id;
  const effectiveDuration = isCurrent && duration > 0 ? duration : Number(track.duration ?? 0);
  const playedPercent = isCurrent && effectiveDuration > 0
    ? Math.max(0, Math.min(1, currentTime / effectiveDuration))
    : 0;

  const handlePlay = () => {
    if (isCurrent) { togglePlay(); return; }
    if (!track.url) return;
    const queue = (allTracks.length > 0 ? allTracks : [track]).map(t => ({
      id: t.id, title: t.title, artist: t.artist,
      albumArt: t.coverUrl ?? "", url: t.url ?? "",
      duration: Number(t.duration ?? 0), likes: t.likes ?? 0,
      plays: t.plays ?? 0, commentsCount: t.commentsCount ?? 0,
      isLiked: t.isLiked ?? false, isReposted: t.isReposted ?? false,
      createdAt: "", updatedAt: "",
    }));
    setQueue(queue);
    setTrack(queue.find(q => q.id === track.id) ?? queue[0]);
  };

  const handleSeek = (percent: number) => {
    if (isCurrent) setCurrentTime(percent * effectiveDuration);
  };

  const likedAgo = useMemo(() => {
    if (!track.likedAt) return null;
    const diffMs   = nowMs - new Date(track.likedAt).getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays < 1)   return "today";
    if (diffDays < 7)   return `${diffDays}d ago`;
    if (diffDays < 30)  return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  }, [track.likedAt, nowMs]);

  const [isLiked, setIsLiked] = useState(track.isLiked ?? true);
  const [likeCount, setLikeCount] = useState(track.likes ?? 0);
  const [isReposted, setIsReposted] = useState(track.isReposted ?? false);
  const [repostCount, setRepostCount] = useState(track.reposts ?? 0);

  const handleLikeToggle = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    try {
      const result = newLiked
        ? await engagementService.likeTrack(track.id)
        : await engagementService.unlikeTrack(track.id);
      if (result?.likeCount !== undefined) setLikeCount(result.likeCount);
    } catch {
      setIsLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  const handleRepost = async () => {
    const newReposted = !isReposted;
    setIsReposted(newReposted);
    setRepostCount(prev => newReposted ? prev + 1 : prev - 1);
    try {
      if (newReposted) await engagementService.repostTrack(track.id);
      else await engagementService.removeRepost(track.id);
    } catch {
      setIsReposted(!newReposted);
      setRepostCount(prev => newReposted ? prev - 1 : prev + 1);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      await commentService.addComment(track.id, commentText.trim());
    } catch (err) {
      console.error("Comment failed:", err);
    }
    setCommentText("");
  };

  const handleCopy = () => {
    if (typeof window !== "undefined")
      navigator.clipboard.writeText(`${track.artist} - ${track.title}`);
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

  return (
    <>
      <div className="flex gap-4 items-start group">
        {/* Cover + Play */}
        <div className="relative shrink-0 cursor-pointer" onClick={handlePlay}>
          <CoverBox
            url={track.coverUrl}
            alt={track.title}
            accentColor={track.accentColor}
            size={140}
            showPlayOverlay={false}
          >
            <span className="text-3xl text-white/30">♪</span>
          </CoverBox>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
              {isCurrent && isPlaying ? (
                <span className="text-[10px] font-bold text-[#111]">❚❚</span>
              ) : (
                <svg width={13} height={13} viewBox="0 0 24 24" fill="#111">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <div className="text-[13px] text-[#aaa]">{track.artist}</div>
              <div className="text-[15px] font-semibold text-white">{track.title}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {track.genre && (
                <span className="border border-[#333] rounded px-2 py-0.5 text-[12px] text-[#aaa]">
                  # {track.genre}
                </span>
              )}
              {likedAgo && (
                <span className="text-[12px] text-[#666]">{likedAgo}</span>
              )}
            </div>
          </div>

          {/* Waveform */}
          <div className="mb-3">
            <Waveform
              data={waveform}
              height={52}
              playedPercent={playedPercent}
              onSeek={handleSeek}
              playedColor="#ff5500"
              unplayedColor="#333"
            />
          </div>

          {/* Comment input */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
              {userInitial}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleCommentSubmit(); }}
              placeholder="Write a comment"
              className="flex-1 bg-[#1a1a1a] border-none outline-none text-[13px] text-[#aaa] px-3 py-1.5 rounded placeholder-[#444]"
            />
            <button
              onClick={handleCommentSubmit}
              className="bg-transparent border-none text-[#555] cursor-pointer hover:text-[#aaa]"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-1.5 border rounded px-3 py-1 text-[12px] cursor-pointer transition-colors bg-transparent ${
                  isLiked ? "border-[#ff5500] text-[#ff5500]" : "border-[#333] text-[#aaa] hover:border-[#555]"
                }`}
              >
                <HeartIcon isFilled={isLiked} />
                {formatNumber(likeCount)}
              </button>
              <button
                onClick={handleRepost}
                className={`flex items-center gap-1.5 border rounded px-3 py-1 text-[12px] cursor-pointer transition-colors bg-transparent ${
                  isReposted ? "border-[#ff5500] text-[#ff5500]" : "border-[#333] text-[#aaa] hover:border-[#555]"
                }`}
              >
                <RepostIcon />
                {formatNumber(repostCount)}
              </button>
              <button
                ref={shareBtnRef}
                onClick={() => setIsShareOpen(true)}
                className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent"
              >
                <ShareIcon />
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent"
              >
                <CopyIcon />
              </button>
              <span ref={moreBtnRef} className="relative inline-flex">
                <button
                  onClick={() => setIsMoreOpen(v => !v)}
                  className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent"
                >
                  <MoreIcon />
                </button>
                {isMoreOpen && (
                  <div className="absolute left-0 top-full mt-1 z-50 min-w-40 bg-[#1c1c1c] border border-[#2e2e2e] rounded shadow-lg py-1">
                    <button
                      onClick={() => {
                        if (!track.url) return;
                        addToQueue({
                          id: track.id, title: track.title, artist: track.artist,
                          albumArt: track.coverUrl ?? "", url: track.url,
                          duration: Number(track.duration ?? 0), likes: track.likes ?? 0,
                          plays: track.plays ?? 0, commentsCount: track.commentsCount ?? 0,
                          isLiked: isLiked, isReposted: isReposted,
                          createdAt: "", updatedAt: "",
                        });
                        setIsMoreOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#ccc] hover:bg-[#2e2e2e] hover:text-white transition-colors cursor-pointer"
                    >
                      Add to queue
                    </button>
                  </div>
                )}
              </span>
            </div>{/* ← closes "flex items-center gap-2" */}

            <div className="flex items-center gap-3 text-[12px] text-[#666]">
              {track.plays !== undefined && <span>▶ {formatNumber(track.plays)}</span>}
              <span>💬 {formatNumber(track.commentsCount ?? 0)}</span>
            </div>
          </div>{/* ← closes "flex items-center justify-between" */}
        </div>{/* ← closes "flex-1 min-w-0 pt-1" */}
      </div>{/* ← closes outer "flex gap-4 items-start group" */}

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

// ─── Track grid card ──────────────────────────────────────────────────────────

interface ITrackGridCardProps {
  track: ILibraryTrack;
}

export function TrackGridCard({ track }: ITrackGridCardProps) {
  const { currentTrack, isPlaying, togglePlay, setTrack } = usePlayerStore();
  const isCurrent = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (!track.url) return;
    if (isCurrent) { togglePlay(); return; }
    setTrack({
      id: track.id, title: track.title, artist: track.artist,
      albumArt: track.coverUrl ?? "", url: track.url,
      duration: Number(track.duration ?? 0), likes: track.likes ?? 0,
      plays: track.plays ?? 0, commentsCount: track.commentsCount ?? 0,
      isLiked: track.isLiked ?? false, isReposted: track.isReposted ?? false,
      createdAt: "", updatedAt: "",
    });
  };

  return (
    <div className="flex flex-col gap-2 group cursor-pointer" onClick={handlePlay}>
      <div className="relative w-[160px] h-[160px] shrink-0">
        <CoverBox
          url={track.coverUrl}
          alt={track.title}
          accentColor={track.accentColor}
          size={160}
          showPlayOverlay={false}
        >
          <span className="text-4xl font-bold text-white/40">♪</span>
        </CoverBox>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-sm">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            {isCurrent && isPlaying ? (
              <span className="text-[10px] font-bold text-[#111]">❚❚</span>
            ) : (
              <svg width={13} height={13} viewBox="0 0 24 24" fill="#111">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
        <HeartIcon isFilled={true} />
        <span className="truncate">{track.title}</span>
      </div>
      <div className="text-[12px] text-[#666] truncate">{track.artist}</div>
    </div>
  );
}