// src/components/Track/TrackCard.tsx
"use client";

import { useState } from "react";
import { type ITrack } from "@/types/userProfile.types";
import { formatNumber } from "@/utils/formatNumber";
import { timeAgo } from "@/utils/timeAgo";
import { TrackCover } from "./TrackCover";
import { Waveform } from "@/components/WaveForm/Waveform";
import { HeartIcon, RepostIcon, ShareIcon, CopyIcon, MoreIcon, IconBtn } from "@/components/Icons/TrackIcons";

interface ITrackCardProps {
  track: ITrack;
  onPlay: (track: ITrack) => void;
}

export function TrackCard({ track, onPlay }: ITrackCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(track.isLiked);

  const handlePlay = () => onPlay(track);
  const handleLikeToggle = () => setIsLiked(v => !v);

  return (
    <div className="flex py-3.5 border-b border-[#161616]">
      <TrackCover size={148} url={track.coverUrl} alt={track.title} accentColor="#111822"/>

      <div className="flex-1 min-w-0 pl-3.5">

        {/* Top row */}
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#888]">
            {track.artist}
            {track.repostedBy && (
              <>
                <span className="text-[#555] mx-1">↻</span>
                <span>{track.repostedBy}</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#555]">{timeAgo(track.createdAt)}</span>
            {track.genre && (
              <span className="text-[11px] bg-[#1c1c1c] border border-[#2e2e2e] text-[#999] rounded px-2 py-0.5">
                # {track.genre}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-[15px] font-semibold text-white mb-2.5">{track.title}</div>

        {/* Play + Waveform + Duration */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            onClick={handlePlay}
            className="w-9 h-9 rounded-full bg-white shrink-0 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="#111">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <Waveform data={track.waveform} playedPercent={track.playedPercent}/>
          <span className="text-[11px] text-[#555] shrink-0">{track.duration}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 items-center">
          <IconBtn
            icon={<HeartIcon isFilled={isLiked}/>}
            count={isLiked ? track.likes + 1 : track.likes}
            active={isLiked}
            onClick={handleLikeToggle}
          />
          <IconBtn icon={<RepostIcon/>} count={track.reposts}/>
          <IconBtn icon={<ShareIcon/>}/>
          <IconBtn icon={<CopyIcon/>}/>
          <IconBtn icon={<MoreIcon/>}/>
          <div className="ml-auto flex gap-3 text-[#444] text-xs">
            <span>▶ {formatNumber(track.plays)}</span>
            <span>💬 {track.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}