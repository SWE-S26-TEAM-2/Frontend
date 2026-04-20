'use client';

// src/app/(with-header)/you/insights/page.tsx

import { useEffect, useState } from 'react';
import {
  InsightsTabs,
  InsightsMetricPills,
  InsightsHeadlineStat,
  InsightsEmptyState,
  InsightsTopTracksCard,
  InsightsPremiumCard,
  InsightsTopLocationsCard,
  InsightsOnSoundCloudCard,
} from '@/components/Insights';
import { insightsService } from '@/services';
import type {
  InsightTab,
  InsightMetric,
  InsightTimeRange,
  IInsightsMetricData,
} from '@/types/insights.types';

const ACTIVE_TIME_RANGE: InsightTimeRange = '30d';
const TIME_RANGE_DISPLAY_LABEL = 'Last 30 days';

const EMPTY_METRICS: IInsightsMetricData = {
  plays: 0,
  likes: 0,
  comments: 0,
  reposts: 0,
  downloads: 0,
};

function isAllZero(metrics: IInsightsMetricData): boolean {
  return (
    metrics.plays === 0 &&
    metrics.likes === 0 &&
    metrics.comments === 0 &&
    metrics.reposts === 0 &&
    metrics.downloads === 0
  );
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<InsightTab>('soundcloud');
  const [activeMetric, setActiveMetric] = useState<InsightMetric>('plays');
  const [metrics, setMetrics] = useState<IInsightsMetricData>(EMPTY_METRICS);
  const [dateRangeLabel, setDateRangeLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await insightsService.getInsights(ACTIVE_TIME_RANGE);
        setMetrics(data.metrics);
        setDateRangeLabel(data.dateRangeLabel);
      } catch (err) {
        console.error('[Insights] failed to fetch:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  const isEmpty = isAllZero(metrics);
  const activeCount = metrics[activeMetric];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)] flex flex-col">
        <div className="w-full px-8 py-8 flex flex-col gap-6">
          <div className="h-8 w-40 rounded bg-[#1a1a1a] animate-pulse" />
          <div className="h-5 w-72 rounded bg-[#1a1a1a] animate-pulse" />
          <div className="h-10 w-96 rounded bg-[#1a1a1a] animate-pulse" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-28 rounded-full bg-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)] flex items-center justify-center">
        <p className="text-[#999] text-sm">{error}</p>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)]">
      <main className="w-full px-8 py-8 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Insights</h1>
          {/* Static time range pill — Phase 2 will make this interactive */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] border border-[#333] text-white text-sm font-semibold cursor-default select-none">
            {TIME_RANGE_DISPLAY_LABEL}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Tab strip */}
        <InsightsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'soundcloud' && (
          <>
            {/* Headline stat */}
            <InsightsHeadlineStat
              metric={activeMetric}
              count={activeCount}
              timeRange={ACTIVE_TIME_RANGE}
            />

            {/* Metric pills + date label row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <InsightsMetricPills
                metrics={metrics}
                activeMetric={activeMetric}
                onMetricChange={setActiveMetric}
              />

              <div className="flex items-center gap-3 text-sm shrink-0">
                <span className="text-[#999]">Data updates every 24 hours</span>
                <span className="text-white font-semibold">{dateRangeLabel}</span>
              </div>
            </div>

            {/* Empty state or chart area */}
            {isEmpty ? (
              <InsightsEmptyState onSwitchToYearly={() => {}} />
            ) : (
              <div className="flex items-center justify-center py-24">
                <p className="text-[#555] text-sm">Chart coming in Phase 2.</p>
              </div>
            )}

            {/* Bottom cards row 1: Top tracks + premium card (2-col) */}
            <div className="grid grid-cols-2 gap-6">
              <InsightsTopTracksCard timeRangeLabel={TIME_RANGE_DISPLAY_LABEL} />
              <InsightsPremiumCard
                metric={activeMetric}
                timeRangeLabel={TIME_RANGE_DISPLAY_LABEL}
              />
            </div>

            {/* Bottom card row 2: Top locations (full-width) */}
            <InsightsTopLocationsCard timeRangeLabel={TIME_RANGE_DISPLAY_LABEL} />

            {/* Bottom card row 3: On SoundCloud (full-width) */}
            <InsightsOnSoundCloudCard timeRangeLabel={TIME_RANGE_DISPLAY_LABEL} />
          </>
        )}

        {activeTab === 'all-platforms' && (
          <div className="flex items-center justify-center py-32">
            <p className="text-[#555] text-sm">All Platforms coming soon.</p>
          </div>
        )}

      </main>
    </div>
  );
}
