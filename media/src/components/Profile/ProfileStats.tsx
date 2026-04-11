// src/app/[username]/components/ProfileStats.tsx

import type { IProfileStatsProps } from "@/types/ui.types";
import { formatNumber } from "@/utils/formatNumber";

export function ProfileStats({ user }: IProfileStatsProps) {
  return (
    <div className="flex justify-between pb-4 mb-4 border-b border-[#1c1c1c]">
      {([
        { label: "Followers", value: user.followers },
        { label: "Following", value: user.following },
        { label: "Tracks",    value: user.tracks    },
      ] as { label: string; value: number }[]).map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="text-2xl font-bold text-white">{formatNumber(value)}</div>
          <div className="text-xs text-[#666] mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}