"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FilterInput } from "@/components/Library/LibraryControls";
import { CoverBox } from "@/components/Library/CoverBox";
import { VerifiedIcon } from "@/components/Icons/ProfileIcons";
import type { ILibraryFollowing } from "@/types/library.types";

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
            <Link
              key={f.id}
              href={`/${f.username}`}
              className="flex flex-col items-center gap-2 group no-underline"
            >
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}