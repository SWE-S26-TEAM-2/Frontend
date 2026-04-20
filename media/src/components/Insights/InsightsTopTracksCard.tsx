'use client';

// src/components/Insights/InsightsTopTracksCard.tsx

import type { IInsightsTopTracksCard } from '@/types/insights.types';

const SKELETON_ROWS = [
  { titleWidth: 'w-32', subtitleWidth: 'w-44' },
  { titleWidth: 'w-36', subtitleWidth: 'w-40' },
  { titleWidth: 'w-28', subtitleWidth: 'w-36' },
];

export default function InsightsTopTracksCard({ timeRangeLabel }: IInsightsTopTracksCard) {
  return (
    <div className="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#181818] overflow-hidden">
      {/* Card body */}
      <div className="flex-1 p-6">
        <h2 className="text-white text-lg font-bold mb-1">Top tracks</h2>
        <p className="text-[#999] text-sm mb-5">{timeRangeLabel}</p>

        <div className="flex flex-col gap-4">
          {SKELETON_ROWS.map((row, i) => (
            <div key={i} className="flex items-center gap-4">
              {/* Artwork skeleton */}
              <div className="shrink-0 w-12 h-12 rounded-sm bg-[#2a2a2a]" aria-hidden="true" />
              {/* Text skeletons */}
              <div className="flex flex-col gap-2">
                <div className={`h-3 rounded bg-[#2a2a2a] ${row.titleWidth}`} aria-hidden="true" />
                <div className={`h-2.5 rounded bg-[#222] ${row.subtitleWidth}`} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] bg-[#141414]">
        <p className="text-[#ccc] text-sm">
          <span className="font-bold">Pro Tip:</span> Edit your Spotlight tracks, which can help get some of your other tracks more listening time.
        </p>
        <button
          type="button"
          className="ml-4 shrink-0 px-5 py-2.5 rounded-full border border-white text-white text-sm font-bold hover:bg-white hover:text-black transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Edit your Spotlight
        </button>
      </div>
    </div>
  );
}
