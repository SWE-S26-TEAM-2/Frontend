'use client';

// src/app/(with-header)/you/insights/page.tsx

import { useEffect, useRef, useState } from 'react';
import {
  InsightsTabs,
  InsightsMetricPills,
  InsightsHeadlineStat,
  InsightsEmptyState,
  InsightsTopTracksCard,
  InsightsPremiumCard,
  InsightsTopLocationsCard,
  InsightsOnSoundCloudCard,
  InsightsAboutModal,
  InsightsAllPlatformsTab,
} from '@/components/Insights';
import { insightsService } from '@/services';
import type {
  InsightTab,
  InsightMetric,
  InsightTimeRange,
  IInsightsMetricData,
} from '@/types/insights.types';

// ── Time range config ─────────────────────────────────────────────────────────

type TimeRangeOption = {
  value: InsightTimeRange;
  label: string;
  dropdownLabel: string;
};

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: '7d',  label: 'Last 7 days',    dropdownLabel: 'Last 7 days'    },
  { value: '30d', label: 'Last 30 days',   dropdownLabel: 'Last 30 days'   },
  { value: '90d', label: 'Last 90 days',   dropdownLabel: 'Last 90 days'   },
  { value: '1y',  label: 'Last 12 months', dropdownLabel: 'Last 12 months' },
];

// The "switch to" button cycles to the next range in the list.
// If already on the last range, it stays (button is hidden by the empty state only when needed).
const SWITCH_TO_LABELS: Record<InsightTimeRange, string> = {
  '7d':  'Switch to last 30 days',
  '30d': 'Switch to last 90 days',
  '90d': 'Switch to last 12 months',
  '1y':  'Switch to last 7 days',
};

const SWITCH_TO_RANGE: Record<InsightTimeRange, InsightTimeRange> = {
  '7d':  '30d',
  '30d': '90d',
  '90d': '1y',
  '1y':  '7d',
};

const DEFAULT_TIME_RANGE: InsightTimeRange = '30d';

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [activeTab, setActiveTab]           = useState<InsightTab>('soundcloud');
  const [activeMetric, setActiveMetric]     = useState<InsightMetric>('plays');
  const [activeRange, setActiveRange]       = useState<InsightTimeRange>(DEFAULT_TIME_RANGE);
  const [isRangeOpen, setIsRangeOpen]       = useState(false);
  const [isAboutOpen, setIsAboutOpen]       = useState(false);
  const [metrics, setMetrics]               = useState<IInsightsMetricData>(EMPTY_METRICS);
  const [dateRangeLabel, setDateRangeLabel] = useState('');
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState('');

  const rangeDropdownRef = useRef<HTMLDivElement>(null);

  // Close the range dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rangeDropdownRef.current && !rangeDropdownRef.current.contains(e.target as Node)) {
        setIsRangeOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsRangeOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch SoundCloud insights whenever the active range changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await insightsService.getInsights(activeRange);
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
  }, [activeRange]);

  const isEmpty       = isAllZero(metrics);
  const activeCount   = metrics[activeMetric];
  const currentOption = TIME_RANGE_OPTIONS.find((o) => o.value === activeRange) ?? TIME_RANGE_OPTIONS[1];
  const displayLabel  = currentOption.label;

  const handleRangeSelect = (value: InsightTimeRange) => {
    setActiveRange(value);
    setIsRangeOpen(false);
  };

  const handleSwitchRange = () => {
    setActiveRange(SWITCH_TO_RANGE[activeRange]);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
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

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)] flex items-center justify-center">
        <p className="text-[#999] text-sm">{error}</p>
      </div>
    );
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)]">
      <main className="w-full px-8 py-8 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Insights</h1>

          <div className="flex items-center gap-3">
            {/* "About these Insights" — only visible on All Platforms tab */}
            {activeTab === 'all-platforms' && (
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] border border-[#333] text-white text-sm font-semibold hover:border-[#555] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                About these Insights
              </button>
            )}

            {/* Time range dropdown */}
            <div className="relative" ref={rangeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRangeOpen((prev) => !prev)}
                aria-expanded={isRangeOpen}
                aria-label="Select time range"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] border border-[#333] text-white text-sm font-semibold hover:border-[#555] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {displayLabel}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={`transition-transform duration-200 ${isRangeOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isRangeOpen && (
                <div
                  role="menu"
                  aria-label="Time range options"
                  className="absolute right-0 top-full mt-2 z-50 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-xl py-1 overflow-hidden"
                >
                  {TIME_RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitem"
                      onClick={() => handleRangeSelect(option.value)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#2a2a2a] transition-colors duration-100"
                    >
                      <span className={activeRange === option.value ? 'text-white font-bold' : 'text-[#ccc]'}>
                        {option.dropdownLabel}
                      </span>
                      {activeRange === option.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab strip */}
        <InsightsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── SoundCloud tab ── */}
        {activeTab === 'soundcloud' && (
          <>
            <InsightsHeadlineStat
              metric={activeMetric}
              count={activeCount}
              timeRange={activeRange}
            />

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

            {isEmpty ? (
              <InsightsEmptyState onSwitchToYearly={handleSwitchRange} />
            ) : (
              <div className="flex items-center justify-center py-24">
                <p className="text-[#555] text-sm">Chart coming in Phase 2.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <InsightsTopTracksCard timeRangeLabel={displayLabel} />
              <InsightsPremiumCard
                metric={activeMetric}
                timeRangeLabel={displayLabel}
              />
            </div>

            <InsightsTopLocationsCard timeRangeLabel={displayLabel} />
            <InsightsOnSoundCloudCard timeRangeLabel={displayLabel} />
          </>
        )}

        {/* ── All Platforms tab ── */}
        {activeTab === 'all-platforms' && (
          <InsightsAllPlatformsTab />
        )}

      </main>

      {/* About modal */}
      {isAboutOpen && (
        <InsightsAboutModal onClose={() => setIsAboutOpen(false)} />
      )}
    </div>
  );
}
