"use client";

import { useState, useMemo } from "react";
import { FilterInput } from "@/components/Library/LibraryControls";
import { CoverBox } from "@/components/Library/CoverBox";
//import { VerifiedIcon } from "@/components/Icons/ProfileIcons";
import { formatNumber } from "@/utils/formatNumber";
import type { ILibraryFollowing } from "@/types/library.types";

// JUST TILL MERGING LAST PR
export const VerifiedIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#1da1f2" />
    <path
      d="M6.5 12.5l3.5 3.5 7-7"
      stroke="white"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

interface IFollowingTabProps {
  following: ILibraryFollowing[];
}

export function FollowingTab({ following }: IFollowingTabProps) {
  const [filter, setFilter] = useState("");

  const filteredFollowing = useMemo(() =>
    following.filter(f => f.username.toLowerCase().includes(filter.toLowerCase())),
    [following, filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[20px] font-bold text-white">Hear what the people you follow have posted:</h2>
        <FilterInput value={filter} onChange={setFilter} />
      </div>
      {filteredFollowing.length === 0 ? (
        <div className="text-[#666] text-sm py-10 text-center">No results match your filter</div>
      ) : (
        <div className="grid grid-cols-6 gap-6">
          {filteredFollowing.map(f => (
            <div key={f.id} className="flex flex-col items-center gap-2 group cursor-pointer">
              <CoverBox
                url={f.avatarUrl}
                alt={f.username}
                accentColor="#2a2a2a"
                size={160}
                rounded
              >
                <span className="text-4xl font-bold text-white/40">{f.username.charAt(0).toUpperCase()}</span>
              </CoverBox>
              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-1 text-[13px] text-[#ccc] group-hover:text-white transition-colors">
                  <span className="truncate max-w-[90%]">{f.username}</span>
                  {f.isVerified && <VerifiedIcon />}
                </div>
                <div className="flex items-center justify-center gap-1 text-[12px] text-[#666]">
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  {formatNumber(f.followers)} followers
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}