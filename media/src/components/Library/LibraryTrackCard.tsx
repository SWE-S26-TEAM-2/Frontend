"use client";

import { useState, useMemo } from "react";
import { formatNumber } from "@/utils/formatNumber";
import { Waveform } from "@/components/Track/Waveform";
import { HeartIcon, RepostIcon, ShareIcon } from "@/components/Icons/TrackIcons";
import { CoverBox } from "@/components/Library/CoverBox";
import type { ILibraryTrack } from "@/types/library.types";
import { engagementService } from "@/services/di";

// ─── Track list row ───────────────────────────────────────────────────────────

interface ITrackListRowProps {
  track: ILibraryTrack;
}

export function TrackListRow({ track }: ITrackListRowProps) {
  const [commentText, setCommentText] = useState("");

  const [userInitial] = useState<string>(() => {
    const username = window.localStorage.getItem("auth_username") ?? "";
    return username.charAt(0).toUpperCase() || "?";
  });
  const [nowMs] = useState<number>(() => Date.now());

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

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    // Wire-up: commentService.postComment(track.id, commentText, currentTimestamp)
    setCommentText("");
  };

  const [isLiked, setIsLiked] = useState(true); // already liked since it's in likes page
  const [likeCount, setLikeCount] = useState(track.likes ?? 0);
  const [isReposted, setIsReposted] = useState(false);

  const handleLikeToggle = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    try {
      const result = newLiked
        ? await engagementService.likeTrack(track.id)
        : await engagementService.unlikeTrack(track.id);
      // Update with real count from API
      if (result?.likeCount !== undefined) {
        setLikeCount(result.likeCount);
      }
    } catch {
      setIsLiked(!newLiked);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  const handleRepost = async () => {
    const newReposted = !isReposted;
    setIsReposted(newReposted);
    try {
      if (newReposted) await engagementService.repostTrack(track.id);
      else await engagementService.removeRepost(track.id);
    } catch {
      setIsReposted(!newReposted);
    }
  };

  return (
    <div className="flex gap-4 items-start group">
      <CoverBox
        url={track.coverUrl}
        alt={track.title}
        accentColor={track.accentColor}
        size={140}
        showPlayOverlay
      >
        <span className="text-3xl text-white/30">♪</span>
      </CoverBox>

      <div className="flex-1 min-w-0 pt-1">
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

        <div className="mb-3">
          {track.waveformData && track.waveformData.length > 0 ? (
            <Waveform
              data={track.waveformData}
              height={52}
              playedPercent={0}
              playedColor="#ff5500"
              unplayedColor="#333"
            />
          ) : (
            <div className="w-full h-14 bg-[#111] rounded flex items-center justify-center">
              <span className="text-[11px] text-[#444]">No waveform available</span>
            </div>
          )}
        </div>

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
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

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
              {track.reposts !== undefined && formatNumber(track.reposts)}
            </button>
            <button className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent">
              <ShareIcon />
            </button>
            <button className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent">
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button className="flex items-center justify-center border border-[#333] rounded px-2.5 py-1 text-[#aaa] cursor-pointer hover:border-[#555] transition-colors bg-transparent">
              <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#666]">
            {track.plays !== undefined && <span>▶ {formatNumber(track.plays)}</span>}
            <span>💬 {track.reposts ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Track grid card ──────────────────────────────────────────────────────────

interface ITrackGridCardProps {
  track: ILibraryTrack;
}

export function TrackGridCard({ track }: ITrackGridCardProps) {
  return (
    <div className="flex flex-col gap-2 group cursor-pointer">
      <CoverBox
        url={track.coverUrl}
        alt={track.title}
        accentColor={track.accentColor}
        size={160}
        showPlayOverlay
      >
        <span className="text-4xl font-bold text-white/40">♪</span>
      </CoverBox>
      <div className="flex items-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
        <HeartIcon isFilled={true} />
        <span className="truncate">{track.title}</span>
      </div>
      <div className="text-[12px] text-[#666] truncate">{track.artist}</div>
    </div>
  );
}