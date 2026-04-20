// src/types/insights.types.ts
 
export type InsightTab = 'soundcloud' | 'all-platforms';
 
export type InsightMetric = 'plays' | 'likes' | 'comments' | 'reposts' | 'downloads';
 
export type InsightTimeRange = '7d' | '30d' | '90d' | '1y';
 
export interface IInsightsMetricData {
  plays: number;
  likes: number;
  comments: number;
  reposts: number;
  downloads: number;
}
 
export interface IInsightsData {
  metrics: IInsightsMetricData;
  dateRangeLabel: string; // e.g. "Mar 21 - Apr 19"
}
 
export interface IInsightsService {
  getInsights(timeRange: InsightTimeRange): Promise<IInsightsData>;
}
 
export interface IInsightsMetricPill {
  metric: InsightMetric;
  count: number;
}
 
export interface IInsightsTabs {
  activeTab: InsightTab;
  onTabChange: (tab: InsightTab) => void;
}
 
export interface IInsightsHeadlineStat {
  metric: InsightMetric;
  count: number;
  timeRange: InsightTimeRange;
}
 
export interface IInsightsEmptyState {
  onSwitchToYearly: () => void;
}
 
export interface IInsightsPremiumCard {
  metric: InsightMetric;
  timeRangeLabel: string;
}
 
export interface IInsightsTopTracksCard {
  timeRangeLabel: string;
}