"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IProfileActionsProps } from "@/types/ui.types";
import { ShareIcon } from "@/components/Icons/TrackIcons";
import { ShareModal } from "@/components/Share/Share";
import { userProfileService } from "@/services/di";

const StationIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="2"/>
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49"/>
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14"/>
  </svg>
);

const EditIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export function ProfileActions({ user, onEditOpen }: IProfileActionsProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleFollow = async () => {
    if (followLoading) return;
    const nextIsFollowing = !isFollowing;
    setIsFollowing(nextIsFollowing);
    setFollowLoading(true);
    try {
      if (nextIsFollowing) {
        await userProfileService.followUser(user.username);
      } else {
        await userProfileService.unfollowUser(user.username);
      }
    } catch {
      setIsFollowing(!nextIsFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  if (user.isOwner) {
    return (
      <>
        <div className="flex gap-2 items-center shrink-0">
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
          >
            <ShareIcon /> Share
          </button>
          <button
            onClick={() => onEditOpen?.()}
            className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-4 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
          >
            <EditIcon /> Edit
          </button>
        </div>

        {isShareOpen && (
          <ShareModal username={user.username} onClose={() => setIsShareOpen(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2 items-center shrink-0">
        <button className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
          <StationIcon /> Station
        </button>
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm cursor-pointer font-medium transition-colors disabled:opacity-70 ${
            isFollowing
              ? "bg-transparent border border-[#2e2e2e] text-[#ccc] hover:border-white"
              : "bg-[#ff5500] border border-[#ff5500] text-white hover:bg-[#e64d00]"
          }`}
        >
          👤 {isFollowing ? "Following" : "Follow"}
        </button>
        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center gap-1.5 bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
        >
          <ShareIcon /> Share
        </button>
        <button
          onClick={() => router.push(`/messages`)}
          className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors"
        >
          ✉
        </button>
        <button className="bg-transparent border border-[#2e2e2e] text-[#ccc] rounded px-3 py-1.5 text-sm cursor-pointer hover:border-white transition-colors">
          ···
        </button>
      </div>

      {isShareOpen && (
        <ShareModal username={user.username} onClose={() => setIsShareOpen(false)} />
      )}
    </>
  );
}
