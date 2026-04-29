'use client';

// src/components/Insights/InsightsMetricPills.tsx

import type { InsightMetric, IInsightsMetricData, IInsightsMetricPillsProps } from '@/types/insights.types';

type PillConfig = {
  metric: InsightMetric;
  label: string;
  icon: React.ReactNode;
};

const PILL_CONFIGS: PillConfig[] = [
  {
    metric: 'plays',
    label: 'plays',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="5,3 19,12 5,21" />
      </svg>
    ),
  },
  {
    metric: 'likes',
    label: 'likes',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    metric: 'comments',
    label: 'comments',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    metric: 'reposts',
    label: 'reposts',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    metric: 'downloads',
    label: 'downloads',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="8 12 12 16 16 12" />
        <line x1="12" y1="8" x2="12" y2="16" />
      </svg>
    ),
  },
];

const METRIC_KEYS: Record<InsightMetric, keyof IInsightsMetricData> = {
  plays:     'plays',
  likes:     'likes',
  comments:  'comments',
  reposts:   'reposts',
  downloads: 'downloads',
};

export default function InsightsMetricPills({
  metrics,
  activeMetric,
  onMetricChange,
}: IInsightsMetricPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PILL_CONFIGS.map(({ metric, label, icon }) => {
        const isActive = activeMetric === metric;
        const count = metrics[METRIC_KEYS[metric]];

        return (
          <button
            key={metric}
            type="button"
            onClick={() => onMetricChange(metric)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
              transition-colors duration-150 border
              ${isActive
                ? 'bg-transparent border-white text-white'
                : 'bg-transparent border-[#333] text-[#999] hover:border-[#555] hover:text-white'
              }
            `}
          >
            {icon}
            {count} {label}
          </button>
        );
      })}
    </div>
  );
}
