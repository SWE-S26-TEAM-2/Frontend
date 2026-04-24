'use client';

// src/components/Insights/InsightsOnSoundCloudCard.tsx

import { useState } from 'react';

type OnSoundCloudSubTab = 'albums-playlists' | 'algorithms' | 'soundcloud-apps';

interface IInsightsOnSoundCloudCardProps {
  timeRangeLabel: string;
}

const SUB_TABS: { id: OnSoundCloudSubTab; label: string }[] = [
  { id: 'albums-playlists', label: 'Albums & Playlists' },
  { id: 'algorithms', label: 'Algorithms' },
  { id: 'soundcloud-apps', label: 'SoundCloud Apps' },
];

// 6 skeleton items arranged in 3 columns × 2 rows
const SKELETON_ITEMS = [
  { titleWidth: 'w-28', subtitleWidth: 'w-36' },
  { titleWidth: 'w-32', subtitleWidth: 'w-40' },
  { titleWidth: 'w-24', subtitleWidth: 'w-32' },
  { titleWidth: 'w-30', subtitleWidth: 'w-28' },
  { titleWidth: 'w-28', subtitleWidth: 'w-36' },
  { titleWidth: 'w-20', subtitleWidth: 'w-30' },
];

export default function InsightsOnSoundCloudCard({
  timeRangeLabel,
}: IInsightsOnSoundCloudCardProps) {
  const [activeSubTab, setActiveSubTab] = useState<OnSoundCloudSubTab>('soundcloud-apps');

  return (
    <div className="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#181818] overflow-hidden">
      {/* Card body */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">On SoundCloud</h2>
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

        {/* Sub-tabs */}
        <nav className="flex gap-5 mb-4" aria-label="On SoundCloud sub-tabs">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`text-sm transition-colors duration-150 ${
                activeSubTab === tab.id
                  ? 'text-white font-bold'
                  : 'text-[#999] font-normal hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <p className="text-[#999] text-sm mb-5">{timeRangeLabel}</p>

        {/* Skeleton grid — 3 columns × 2 rows, same for all sub-tabs */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-5">
          {SKELETON_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-sm bg-[#2a2a2a]" aria-hidden="true" />
              <div className="flex flex-col gap-2 min-w-0">
                <div className={`h-3 rounded bg-[#2a2a2a] ${item.titleWidth}`} aria-hidden="true" />
                <div className={`h-2.5 rounded bg-[#222] ${item.subtitleWidth}`} aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] bg-[#141414]">
        <p className="text-[#ccc] text-sm">
          View your stream Sources with Artist or Artist Pro
        </p>
        <button
          type="button"
          className="ml-4 shrink-0 px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-[#e0e0e0] transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Get started
        </button>
      </div>
    </div>
  );
}
