// src/app/[username]/components/TrackCard.tsx
"use client";

import { useState } from "react";
import { type Track } from "@/services/userProfile.service";
import { formatNumber } from "@/utils/formatNumber";
import { timeAgo } from "@/utils/timeAgo";
import { TrackCover } from "@/components/Track/TrackCover";
import { Waveform } from "@/components/WaveForm/Waveform";
import { HeartIcon, RepostIcon, ShareIcon, CopyIcon, MoreIcon, IconBtn } from "@/components/Icons/TrackIcons";

interface ITrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

export function TrackCard({ track, onPlay }: ITrackCardProps) {
  const [isLiked, setIsLiked] = useState<boolean>(track.isLiked);

  return (
    <div style={{ display: "flex", padding: "14px 0", borderBottom: "1px solid #161616" }}>
      <TrackCover size={148} url={track.coverUrl} alt={track.title} accentColor="#111822"/>

      <div style={{ flex: 1, minWidth: 0, paddingLeft: 14 }}>

        {/* Top row: artist / repost + time + genre */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            {track.artist}
            {track.repostedBy && (
              <>
                <span style={{ color: "#555", margin: "0 4px" }}>↻</span>
                <span>{track.repostedBy}</span>
              </>
            )}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: "#555" }}>{timeAgo(track.createdAt)}</span>
            {track.genre && (
              <span style={{
                fontSize: 11, background: "#1c1c1c", border: "1px solid #2e2e2e",
                color: "#999", borderRadius: 2, padding: "2px 8px",
              }}>
                # {track.genre}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 10 }}>
          {track.title}
        </div>

        {/* Play + Waveform + Duration */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div
            onClick={() => onPlay(track)}
            style={{
              width: 36, height: 36, borderRadius: "50%", background: "#fff",
              flexShrink: 0, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="#111">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <Waveform data={track.waveform} playedPercent={track.playedPercent}/>
          <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>{track.duration}</span>
        </div>

        {/* Action buttons + stats */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <IconBtn
            icon={<HeartIcon isFilled={isLiked}/>}
            count={isLiked ? track.likes + 1 : track.likes}
            active={isLiked}
            onClick={() => setIsLiked(v => !v)}
          />
          <IconBtn icon={<RepostIcon/>} count={track.reposts}/>
          <IconBtn icon={<ShareIcon/>}/>
          <IconBtn icon={<CopyIcon/>}/>
          <IconBtn icon={<MoreIcon/>}/>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, color: "#444", fontSize: 12 }}>
            <span>▶ {formatNumber(track.plays)}</span>
            <span>💬 {track.comments}</span>
          </div>
        </div>

      </div>
    </div>
  );
}