// src/types/insights.types.ts

export type InsightTab = 'soundcloud' | 'all-platforms';

export type InsightMetric = 'plays' | 'likes' | 'comments' | 'reposts' | 'downloads';

export type InsightTimeRange = 'today' | '7d' | '30d' | '90d' | '1y' | 'alltime';

// ── Chart ─────────────────────────────────────────────────────────────────────

export interface IInsightsChartBar {
  label: string;
  value: number;
  isCurrentPeriod: boolean;
}

export interface IInsightsChartData {
  bars: IInsightsChartBar[];
}

// ── Top Tracks ────────────────────────────────────────────────────────────────

export interface IInsightsTopTrack {
  id: string;
  title: string;
  plays: number;
  artworkUrl?: string;
}

// ── Metric Data ───────────────────────────────────────────────────────────────

export interface IInsightsMetricData {
  plays: number;
  likes: number;
  comments: number;
  reposts: number;
  downloads: number;
}

// ── API Response ──────────────────────────────────────────────────────────────

export interface IInsightsData {
  metrics: IInsightsMetricData;
  chartData: Record<InsightMetric, IInsightsChartData>;
  topTracks: IInsightsTopTrack[];
  dateRangeLabel: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export interface IInsightsService {
  getInsights(timeRange: InsightTimeRange): Promise<IInsightsData>;
}

// ── Component Props ───────────────────────────────────────────────────────────

export interface IInsightsTabs {
  activeTab: InsightTab;
  onTabChange: (tab: InsightTab) => void;
}

export interface IInsightsHeadlineStat {
  metric: InsightMetric;
  count: number;
  timeRange: InsightTimeRange;
}

export interface IInsightsMetricPill {
  metric: InsightMetric;
  count: number;
}

export interface IInsightsMetricPillsProps {
  metrics: IInsightsMetricData;
  activeMetric: InsightMetric;
  onMetricChange: (metric: InsightMetric) => void;
}

export interface IInsightsEmptyState {
  timeRange: InsightTimeRange;
  onSwitchRange: (range: InsightTimeRange) => void;
}

export interface IInsightsChartProps {
  chartData: IInsightsChartData;
}

export interface IInsightsTimeRangeDropdown {
  activeRange: InsightTimeRange;
  onRangeChange: (range: InsightTimeRange) => void;
  onClose: () => void;
}

export interface IInsightsPremiumCard {
  metric: InsightMetric;
  timeRangeLabel: string;
}

export interface IInsightsTopTracksCard {
  tracks: IInsightsTopTrack[];
  timeRangeLabel: string;
}

export interface IInsightsAboutModal {
  onClose: () => void;
}