'use client';

// src/components/Insights/InsightsEmptyState.tsx

import type { IInsightsEmptyState } from '@/types/insights.types';

export default function InsightsEmptyState({ onSwitchToYearly }: IInsightsEmptyState) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-white text-base font-bold mb-2">
        Looks like there is no activity for the selected timeframe
      </p>
      <p className="text-[#999] text-sm mb-6">Try selecting another timeframe.</p>
      <button
        type="button"
        onClick={onSwitchToYearly}
        className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-[#e0e0e0] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Switch to last 12 months
      </button>
    </div>
  );
}
