// src/components/Profile/ProfileStats.tsx

import Link from "next/link";
import type { IProfileStatsProps } from "@/types/ui.types";
import { formatNumber } from "@/utils/formatNumber";

export function ProfileStats({ user, tracksCount }: IProfileStatsProps) {
  const base = `/${user.username}`;

  const stats = [
    { label: "Followers", value: user.followers, href: `${base}/followers` },
    { label: "Following", value: user.following, href: `${base}/following` },
    { label: "Tracks",    value: tracksCount ?? user.tracks,    href: `${base}?tab=Tracks` },
  ] as { label: string; value: number; href: string }[];

  return (
    <div className="flex justify-between pb-4 mb-4 border-b border-[#1c1c1c]">
      {stats.map(({ label, value, href }) => (
        <Link
          key={label}
          href={href}
          className="text-center no-underline group"
        >
          <div className="text-2xl font-bold text-white group-hover:text-[#ff5500] transition-colors">
            {formatNumber(value)}
          </div>
          <div className="text-xs text-[#666] mt-0.5 group-hover:text-[#ff5500] transition-colors">
            {label}
          </div>
        </Link>
      ))}
    </div>
  );
}