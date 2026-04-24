// src/services/api/insights.api.ts
 
import type { IInsightsData, IInsightsService, InsightTimeRange } from '@/types/insights.types';
 
export const realInsightsService: IInsightsService = {
  async getInsights(timeRange: InsightTimeRange): Promise<IInsightsData> {
    const res = await fetch(`/api/insights?timeRange=${timeRange}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },
};