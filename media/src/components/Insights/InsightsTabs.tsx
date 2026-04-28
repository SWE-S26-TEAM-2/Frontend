'use client';

// src/components/Insights/InsightsTabs.tsx

import type { IInsightsTabs, InsightTab } from '@/types/insights.types';

const TABS: { id: InsightTab; label: string }[] = [
  { id: 'soundcloud', label: 'SoundCloud' },
  { id: 'all-platforms', label: 'All Platforms' },
];

export default function InsightsTabs({ activeTab, onTabChange }: IInsightsTabs) {
  return (
    <nav className="flex gap-6 border-b border-[#2a2a2a]" aria-label="Insights tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors duration-150
            ${activeTab === tab.id
              ? 'text-white border-white'
              : 'text-[#999] border-transparent hover:text-white'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
