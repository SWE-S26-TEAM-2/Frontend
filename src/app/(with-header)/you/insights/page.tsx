'use client';

// src/app/(with-header)/you/insights/page.tsx

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  InsightsChart,
} from '@/components/Insights';
import { insightsService } from '@/services';
import type {
  InsightTab,
  InsightMetric,
  InsightTimeRange,
  IInsightsMetricData,
  IInsightsTopTrack,
  IInsightsData,
} from '@/types/insights.types';

// ── Time range config ─────────────────────────────────────────────────────────

type TimeRangeOption = {
  value: InsightTimeRange;
  label: string;
  dropdownLabel: string;
};

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'today',   label: 'Today',           dropdownLabel: 'Today'           },
  { value: '7d',      label: 'Last 7 days',     dropdownLabel: 'Last 7 days'     },
  { value: '30d',     label: 'Last 30 days',    dropdownLabel: 'Last 30 days'    },
  { value: '1y',      label: 'Last 12 months',  dropdownLabel: 'Last 12 months' },
  { value: 'alltime', label: 'All time',        dropdownLabel: 'All time'        },
];

const DEFAULT_TIME_RANGE: InsightTimeRange = '30d';

const VALID_TABS: InsightTab[]     = ['soundcloud', 'all-platforms'];
const VALID_METRICS: InsightMetric[] = ['plays', 'likes', 'comments', 'reposts', 'downloads'];

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

// ── Main Content Component ───────────────────────────────────────────────────

function InsightsContent() {
  const searchParams = useSearchParams();

  // Read initial tab + metric from URL params, falling back to defaults
  const initialTab = ((): InsightTab => {
    const param = searchParams.get('tab');
    return param && VALID_TABS.includes(param as InsightTab)
      ? (param as InsightTab)
      : 'soundcloud';
  })();

  const initialMetric = ((): InsightMetric => {
    const param = searchParams.get('metric');
    return param && VALID_METRICS.includes(param as InsightMetric)
      ? (param as InsightMetric)
      : 'plays';
  })();

  const [activeTab, setActiveTab]           = useState<InsightTab>(initialTab);
  const [activeMetric, setActiveMetric]     = useState<InsightMetric>(initialMetric);
  const [activeRange, setActiveRange]       = useState<InsightTimeRange>(DEFAULT_TIME_RANGE);
  const [isRangeOpen, setIsRangeOpen]       = useState(false);
  const [isAboutOpen, setIsAboutOpen]       = useState(false);
  const [metrics, setMetrics]               = useState<IInsightsMetricData>(EMPTY_METRICS);
  const [topTracks, setTopTracks]           = useState<IInsightsTopTrack[]>([]);
  const [chartData, setChartData]           = useState<IInsightsData['chartData'] | null>(null);
  const [dateRangeLabel, setDateRangeLabel] = useState('');
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState('');

  const rangeDropdownRef = useRef<HTMLDivElement>(null);

  // Close the range dropdown on outside click or Escape
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
        setTopTracks(data.topTracks);
        setChartData(data.chartData);
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

  const handleSwitchRange = (nextRange: InsightTimeRange) => {
    setActiveRange(nextRange);
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

  // ── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)]">
      <main className="w-full px-8 py-8 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Insights</h1>

          <div className="flex items-center gap-3">
            {activeTab === 'all-platforms' && (
              <button
                type="button"
                onClick={() => setIsAboutOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] border border-[#333] text-white text-sm font-semibold hover:border-[#555] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                About these Insights
              </button>
            )}

            <div className="relative" ref={rangeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRangeOpen((prev) => !prev)}
                aria-expanded={isRangeOpen}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a1a1a] border border-[#333] text-white text-sm font-semibold hover:border-[#555] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {displayLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform duration-200 ${isRangeOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isRangeOpen && (
                <div role="menu" className="absolute right-0 top-full mt-2 z-50 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-xl py-1 overflow-hidden">
                  {TIME_RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleRangeSelect(option.value)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#2a2a2a] transition-colors duration-100"
                    >
                      <span className={activeRange === option.value ? 'text-white font-bold' : 'text-[#ccc]'}>
                        {option.dropdownLabel}
                      </span>
                      {activeRange === option.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
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

        <InsightsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'soundcloud' && (
          <>
            <InsightsHeadlineStat metric={activeMetric} count={activeCount} timeRange={activeRange} />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <InsightsMetricPills metrics={metrics} activeMetric={activeMetric} onMetricChange={setActiveMetric} />
              <div className="flex items-center gap-3 text-sm shrink-0">
                <span className="text-[#999]">Data updates every 24 hours</span>
                <span className="text-white font-semibold">{dateRangeLabel}</span>
              </div>
            </div>

            {isEmpty ? (
              <InsightsEmptyState timeRange={activeRange} onSwitchRange={handleSwitchRange} />
            ) : chartData ? (
              <InsightsChart chartData={chartData[activeMetric]} />
            ) : null}

            <div className="grid grid-cols-2 gap-6">
              <InsightsTopTracksCard tracks={topTracks} timeRangeLabel={displayLabel} />
              <InsightsPremiumCard metric={activeMetric} timeRangeLabel={displayLabel} />
            </div>

            <InsightsTopLocationsCard timeRangeLabel={displayLabel} />
            <InsightsOnSoundCloudCard timeRangeLabel={displayLabel} />
          </>
        )}

        {activeTab === 'all-platforms' && <InsightsAllPlatformsTab />}
      </main>

      {isAboutOpen && <InsightsAboutModal onClose={() => setIsAboutOpen(false)} />}
    </div>
  );
}

// ── Exported Page with Suspense Boundary ─────────────────────────────────────

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)] flex flex-col">
        <div className="w-full px-8 py-8 flex flex-col gap-6">
          <div className="h-8 w-40 rounded bg-[#1a1a1a] animate-pulse" />
          <div className="h-5 w-72 rounded bg-[#1a1a1a] animate-pulse" />
        </div>
      </div>
    }>
      <InsightsContent />
    </Suspense>
  );
}