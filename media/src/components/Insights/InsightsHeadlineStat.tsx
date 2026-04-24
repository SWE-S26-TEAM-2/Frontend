'use client';

// src/components/Insights/InsightsHeadlineStat.tsx

import type { IInsightsHeadlineStat, InsightTimeRange } from '@/types/insights.types';

function buildHeadlineText(metric: string, count: number, timeRange: InsightTimeRange): string {
  switch (timeRange) {
    case 'today':
      return `${count} ${metric} today`;
    case '7d':
      return `${count} ${metric} in the last 7 days`;
    case '30d':
      return `${count} ${metric} in the last 30 days`;
    case '1y':
      return `${count} ${metric} in the last 12 months`;
    case 'alltime':
      return `${count} ${metric} since 2016`;
    default:
      return `${count} ${metric}`;
  }
}

export default function InsightsHeadlineStat({
  metric,
  count,
  timeRange,
}: IInsightsHeadlineStat) {
  const text = buildHeadlineText(metric, count, timeRange);

  //before
  // return (
  //   <h1 className="text-4xl font-bold text-white leading-tight">
  //     {text}
  //     {count === 0 && (
  //       <span className="text-[#999] font-bold"> (0%)</span>
  //     )}
  //   </h1>
  // );

  // AFTER — demote to <p> since page.tsx owns the <h1>
  return (
    <p className="text-4xl font-bold text-white leading-tight">
      {text}
      {count === 0 && (
        <span className="text-[#999] font-bold"> (0%)</span>
      )}
    </p>
  );
}
