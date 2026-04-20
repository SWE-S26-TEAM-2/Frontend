// src/services/mocks/insights.mock.ts
 
import type { IInsightsData, IInsightsService, InsightTimeRange } from '@/types/insights.types';
 
const MOCK_DATA: Record<InsightTimeRange, IInsightsData> = {
  '7d': {
    metrics: {
      plays: 0,
      likes: 0,
      comments: 0,
      reposts: 0,
      downloads: 0,
    },
    dateRangeLabel: 'Apr 12 - Apr 19',
  },
  '30d': {
    metrics: {
      plays: 0,
      likes: 0,
      comments: 0,
      reposts: 0,
      downloads: 0,
    },
    dateRangeLabel: 'Mar 21 - Apr 19',
  },
  '90d': {
    metrics: {
      plays: 0,
      likes: 0,
      comments: 0,
      reposts: 0,
      downloads: 0,
    },
    dateRangeLabel: 'Jan 20 - Apr 19',
  },
  '1y': {
    metrics: {
      plays: 3842,
      likes: 198,
      comments: 47,
      reposts: 83,
      downloads: 21,
    },
    dateRangeLabel: 'Apr 19, 2025 - Apr 19, 2026',
  },
};
 
export const mockInsightsService: IInsightsService = {
  async getInsights(timeRange: InsightTimeRange): Promise<IInsightsData> {
    console.log('[MOCK] insightsService.getInsights called', { timeRange });
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_DATA[timeRange];
  },
};