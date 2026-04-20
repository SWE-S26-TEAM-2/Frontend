// src/services/mocks/insights.mock.ts
 
import type {
  IInsightsChartBar,
  IInsightsChartData,
  IInsightsData,
  IInsightsService,
  IInsightsTopTrack,
  InsightMetric,
  InsightTimeRange,
} from '@/types/insights.types';
 
// ── Helpers ───────────────────────────────────────────────────────────────────
 
function makeUniformBars(labels: string[], hotIndex: number, hotValue: number): IInsightsChartBar[] {
  return labels.map((label, i) => ({
    label,
    value: i === hotIndex ? hotValue : 0,
    isCurrentPeriod: i === hotIndex,
  }));
}
 
function buildChartData(bars: IInsightsChartBar[]): Record<InsightMetric, IInsightsChartData> {
  // For plays: the hot bar gets the plays value; for others the hot bar gets their metric value.
  // Since we build per metric below, this helper just wraps bars for one metric.
  return {
    plays:     { bars },
    likes:     { bars },
    comments:  { bars },
    reposts:   { bars },
    downloads: { bars },
  };
}
 
function buildPerMetricChartData(
  labels: string[],
  hotIndex: number,
  metrics: { plays: number; likes: number; comments: number; reposts: number; downloads: number },
): Record<InsightMetric, IInsightsChartData> {
  const make = (value: number): IInsightsChartBar[] =>
    labels.map((label, i) => ({
      label,
      value: i === hotIndex ? value : 0,
      isCurrentPeriod: i === hotIndex,
    }));
 
  return {
    plays:     { bars: make(metrics.plays) },
    likes:     { bars: make(metrics.likes) },
    comments:  { bars: make(metrics.comments) },
    reposts:   { bars: make(metrics.reposts) },
    downloads: { bars: make(metrics.downloads) },
  };
}
 
// ── Today: hourly bars (00:00 – 22:00 in 2h steps, current hour bar = orange) ─
 
function buildTodayBars(metrics: IInsightsData['metrics']): Record<InsightMetric, IInsightsChartData> {
  const labels: string[] = [];
  for (let h = 0; h < 24; h += 2) {
    labels.push(`${String(h).padStart(2, '0')}:00`);
  }
  const now = new Date();
  const currentHour = now.getHours();
  const hotIndex = Math.min(Math.floor(currentHour / 2), labels.length - 1);
  return buildPerMetricChartData(labels, hotIndex, metrics);
}
 
// ── Last 7 days: one bar per day ──────────────────────────────────────────────
 
function buildLast7DaysBars(metrics: IInsightsData['metrics']): Record<InsightMetric, IInsightsChartData> {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  // hotIndex = last bar (today)
  return buildPerMetricChartData(labels, labels.length - 1, metrics);
}
 
// ── Last 30 days: one bar every 2 days ───────────────────────────────────────
 
function buildLast30DaysBars(metrics: IInsightsData['metrics']): Record<InsightMetric, IInsightsChartData> {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 28; i >= 0; i -= 2) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }));
  }
  return buildPerMetricChartData(labels, labels.length - 1, metrics);
}
 
// ── Last 12 months: one bar per month ────────────────────────────────────────
 
function buildLast12MonthsBars(metrics: IInsightsData['metrics']): Record<InsightMetric, IInsightsChartData> {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
  }
  return buildPerMetricChartData(labels, labels.length - 1, metrics);
}
 
// ── All time: yearly bars from 2016 to current year ──────────────────────────
 
function buildAllTimeBars(metrics: IInsightsData['metrics']): Record<InsightMetric, IInsightsChartData> {
  const currentYear = new Date().getFullYear();
  const labels: string[] = [];
  for (let y = 2016; y <= currentYear; y++) {
    labels.push(String(y));
  }
  return buildPerMetricChartData(labels, labels.length - 1, metrics);
}
 
// ── Date range label helpers ──────────────────────────────────────────────────
 
function formatShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
 
function computeDateRangeLabel(timeRange: InsightTimeRange): string {
  const today = new Date();
  switch (timeRange) {
    case 'today': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return `${formatShort(yesterday)} - ${formatShort(today)}`;
    }
    case '7d': {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return `${formatShort(start)} - ${formatShort(today)}`;
    }
    case '30d': {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return `${formatShort(start)} - ${formatShort(today)}`;
    }
    case '1y': {
      const startYear = new Date(today.getFullYear() - 1, today.getMonth(), 1);
      const startLabel = startYear.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const endLabel = today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      return `${startLabel} - ${endLabel}`;
    }
    case 'alltime':
      return '2016 - Present';
    default:
      return '';
  }
}
 
// ── Top tracks mock ───────────────────────────────────────────────────────────
 
const MOCK_TOP_TRACKS: IInsightsTopTrack[] = [
  {
    id: 'mock-track-8',
    title: 'Golden Hour',
    plays: 2341,
    artworkUrl: undefined,
  },
  {
    id: 'mock-track-6',
    title: 'Neon Pulse',
    plays: 876,
    artworkUrl: undefined,
  },
  {
    id: 'mock-track-1',
    title: 'Midnight Drive',
    plays: 1243,
    artworkUrl: undefined,
  },
];
 
// ── Mock metrics per range ────────────────────────────────────────────────────
 
const MOCK_METRICS: Record<InsightTimeRange, IInsightsData['metrics']> = {
  today:   { plays: 0, likes: 0, comments: 0, reposts: 0, downloads: 0 },
  '7d':    { plays: 0, likes: 0, comments: 0, reposts: 0, downloads: 0 },
  '30d':   { plays: 0, likes: 0, comments: 0, reposts: 0, downloads: 0 },
  '1y':    { plays: 3842, likes: 198, comments: 47, reposts: 83, downloads: 21 },
  alltime: { plays: 4580, likes: 210, comments: 52, reposts: 91, downloads: 30 },
};
 
// ── Service ───────────────────────────────────────────────────────────────────
 
export const mockInsightsService: IInsightsService = {
  async getInsights(timeRange: InsightTimeRange): Promise<IInsightsData> {
    console.log('[MOCK] insightsService.getInsights called', { timeRange });
    await new Promise((resolve) => setTimeout(resolve, 400));
 
    const metrics = MOCK_METRICS[timeRange];
 
    let chartData: Record<InsightMetric, IInsightsChartData>;
    switch (timeRange) {
      case 'today':   chartData = buildTodayBars(metrics);        break;
      case '7d':      chartData = buildLast7DaysBars(metrics);    break;
      case '30d':     chartData = buildLast30DaysBars(metrics);   break;
      case '1y':      chartData = buildLast12MonthsBars(metrics); break;
      case 'alltime': chartData = buildAllTimeBars(metrics);      break;
    }
 
    return {
      metrics,
      chartData,
      topTracks: MOCK_TOP_TRACKS,
      dateRangeLabel: computeDateRangeLabel(timeRange),
    };
  },
};