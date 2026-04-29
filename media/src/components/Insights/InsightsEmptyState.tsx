'use client';

// src/components/Insights/InsightsEmptyState.tsx

import type { IInsightsEmptyState, InsightTimeRange } from '@/types/insights.types';

const NEXT_RANGE: Record<InsightTimeRange, InsightTimeRange | null> = {
  today:   '7d',
  '7d':    '30d',
  '30d':   '1y',
  '90d': '1y',
  '1y':    'alltime',
  alltime: null,
};

const NEXT_RANGE_LABEL: Record<InsightTimeRange, string> = {
  today:   'last 7 days',
  '7d':    'last 30 days',
  '30d':   'last 12 months',
  '90d': 'last 12 months',
  '1y':    'all time',
  alltime: '',
};

export default function InsightsEmptyState({ timeRange, onSwitchRange }: IInsightsEmptyState) {
  const nextRange = NEXT_RANGE[timeRange];
  const nextLabel = NEXT_RANGE_LABEL[timeRange];

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-white text-base font-bold mb-2">
        Looks like there is no activity for the selected timeframe
      </p>
      <p className="text-[#999] text-sm mb-6">Try selecting another timeframe.</p>
      {nextRange && (
        <button
          type="button"
          onClick={() => onSwitchRange(nextRange)}
          className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-[#e0e0e0] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Switch to {nextLabel}
        </button>
      )}
    </div>
  );
}
