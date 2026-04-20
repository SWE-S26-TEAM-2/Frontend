'use client';

// src/components/Insights/InsightsHeadlineStat.tsx

import type { IInsightsHeadlineStat, InsightTimeRange } from '@/types/insights.types';

const TIME_RANGE_LABELS: Record<InsightTimeRange, string> = {
  '7d': 'last 7 days',
  '30d': 'last 30 days',
  '90d': 'last 90 days',
  '1y': 'last 12 months',
};

export default function InsightsHeadlineStat({
  metric,
  count,
  timeRange,
}: IInsightsHeadlineStat) {
  const rangeLabel = TIME_RANGE_LABELS[timeRange];

  return (
    <h1 className="text-4xl font-bold text-white leading-tight">
      {count.toLocaleString()} {metric}{' '}
      <span className="font-bold">in the {rangeLabel}</span>{' '}
      <span className="text-[#999] font-bold">(0%)</span>
    </h1>
  );
}
