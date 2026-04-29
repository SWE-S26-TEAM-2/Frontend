"use client";

import { IBlockedUser } from "@/types/settings-privacy.types";

interface IBlockedUserCardProps {
  user: IBlockedUser;
  onUnblock: (userId: string) => void;
}

export default function BlockedUserCard({ user, onUnblock }: IBlockedUserCardProps) {
  const initials = user.username
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-semibold">{initials}</span>
      </div>
      <span className="text-white text-sm flex-1">{user.username}</span>
      <button
        onClick={() => onUnblock(user.id)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[#555] hover:border-[#888] text-[#aaa] hover:text-white text-xs rounded-full transition-colors cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
        </svg>
        Unblock
      </button>
    </div>
  );
}