'use client';

// src/components/Insights/InsightsChart.tsx

import type { IInsightsChartProps } from '@/types/insights.types';

export default function InsightsChart({ chartData }: IInsightsChartProps) {
  const { bars } = chartData;
  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Bars */}
      <div className="flex items-end gap-1 h-64 w-full">
        {bars.map((bar, i) => {
          const heightPct = maxValue > 0 ? (bar.value / maxValue) * 100 : 0;

          //before
          // Always render a minimum visible bar height so the chart looks full
          //const minHeightPct = 85;
          //const displayPct = bar.value > 0 ? Math.max(heightPct, minHeightPct) : minHeightPct;

          //after
          const MIN_VISIBLE_PCT = 3;
          // Zero-value bars render flat; non-zero bars get at least MIN_VISIBLE_PCT
          const displayPct = bar.value > 0 ? Math.max(heightPct, MIN_VISIBLE_PCT) : 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end"
              style={{ height: '100%' }}
            >
              <div
                className={bar.isCurrentPeriod ? 'bg-[#f5501e]' : 'bg-[#3a3a3a]'}
                style={{ height: `${displayPct}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 w-full">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[#999] text-xs truncate"
          >
            {bar.label}
          </div>
        ))}
      </div>
    </div>
  );
}
