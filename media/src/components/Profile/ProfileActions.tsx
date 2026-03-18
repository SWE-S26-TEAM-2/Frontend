// src/app/[username]/components/ProfileActions.tsx
"use client";

import { useState } from "react";
import { type IUser } from "@/types/userProfile.types";
import { ShareIcon } from "@/components/Icons/TrackIcons";

interface IProfileActionsProps {
  user: IUser;
}

const StationIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="2"/>
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49"/>
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>
  </svg>
);

export function ProfileActions({ user }: IProfileActionsProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleFollowToggle = () => {
    setIsFollowing(f => !f);
  };

  if (user.isOwner) {
    return (
      <div className="flex gap-2 items-center shrink-0">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
        >
          <ShareIcon/> Share
        </button>
        <button className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
          ✏ Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center shrink-0">
      <button className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
        <StationIcon/> Station
      </button>
      <button
        onClick={handleFollowToggle}
        className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm cursor-pointer font-medium transition-colors ${
          isFollowing
            ? "bg-transparent border border-[#2e2e2e] text-[#ccc] hover:border-white"
            : "bg-[#ff5500] border border-[#ff5500] text-white hover:bg-[#e64d00]"
        }`}
      >
        👤 {isFollowing ? "Following" : "Follow"}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
      >
        <ShareIcon/> Share
      </button>
      <button className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
        ✉
      </button>
      <button className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
        ···
      </button>
    </div>
  );
}