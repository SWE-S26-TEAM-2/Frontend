'use client';

// src/components/Insights/InsightsPremiumCard.tsx

import type { IInsightsPremiumCard, InsightMetric } from '@/types/insights.types';

const CARD_TITLES: Record<InsightMetric, string> = {
  plays: 'Top listeners',
  likes: 'Who liked',
  comments: 'Who commented',
  reposts: 'Who reposted',
  downloads: 'Who downloaded',
};

const CARD_UPGRADE_TEXT: Record<InsightMetric, string> = {
  plays: 'Know who your fans are—see your top listeners with Artist Pro.',
  likes: 'Know who your fans are—see who liked your tracks with Artist Pro.',
  comments: 'Know who your fans are—see who commented on your tracks with Artist Pro.',
  reposts: 'Know who your fans are—see who reposted your tracks with Artist Pro.',
  downloads: 'Know who your fans are—see who downloaded your tracks with Artist Pro.',
};

const SKELETON_ROWS = [
  { nameWidth: 'w-28', subWidth: 'w-36' },
  { nameWidth: 'w-24', subWidth: 'w-32' },
  { nameWidth: 'w-32', subWidth: 'w-28' },
];

export default function InsightsPremiumCard({
  metric,
  timeRangeLabel,
}: IInsightsPremiumCard) {
  const title = CARD_TITLES[metric];
  const upgradeText = CARD_UPGRADE_TEXT[metric];

  return (
    <div className="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#181818] overflow-hidden">
      {/* Card body */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white text-lg font-bold">{title}</h2>
          <button
            type="button"
            className="flex items-center gap-1.5 text-[#999] text-sm hover:text-white transition-colors"
            aria-label="See all (requires upgrade)"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-sm font-semibold">See all</span>
          </button>
        </div>

        <p className="text-[#999] text-sm mb-5">{timeRangeLabel}</p>

        {/* Skeleton rows */}
        <div className="flex flex-col gap-4">
          {SKELETON_ROWS.map((row, i) => (
            <div key={i} className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <div className="shrink-0 w-12 h-12 rounded-full bg-[#2a2a2a]" aria-hidden="true" />
              {/* Text skeletons */}
              <div className="flex flex-col gap-2">
                <div className={`h-3 rounded bg-[#2a2a2a] ${row.nameWidth}`} aria-hidden="true" />
                <div className={`h-2.5 rounded bg-[#222] ${row.subWidth}`} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] bg-[#141414]">
        <p className="text-[#ccc] text-sm">{upgradeText}</p>
        <button
          type="button"
          className="ml-4 shrink-0 px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-[#e0e0e0] transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Upgrade to Artist Pro
        </button>
      </div>
    </div>
  );
}
