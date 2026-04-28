'use client';

// src/components/Insights/InsightsTopLocationsCard.tsx

import WorldMapSvg from './WorldMapSvg';

interface IInsightsTopLocationsCardProps {
  timeRangeLabel: string;
}

export default function InsightsTopLocationsCard({
  timeRangeLabel,
}: IInsightsTopLocationsCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#181818] overflow-hidden">
      {/* Card body */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white text-lg font-bold">Top locations</h2>
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

        {/* Content: skeleton row left, world map right */}
        <div className="flex items-start gap-6">
          <div className="shrink-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-[#2a2a2a]" aria-hidden="true" />
            <div className="flex flex-col gap-2">
              <div className="h-3 rounded bg-[#2a2a2a] w-28" aria-hidden="true" />
              <div className="h-2.5 rounded bg-[#222] w-36" aria-hidden="true" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end overflow-hidden">
            <div className="w-full max-w-lg opacity-80">
              <WorldMapSvg />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] bg-[#141414]">
        <p className="text-[#ccc] text-sm">
          See the rest of your top countries and cities with Artist Pro
        </p>
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
