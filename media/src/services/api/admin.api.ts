import { ENV } from "@/config/env";
import type { IAdminService, IAdminUser, IAdminTrack, IAdminStats, IAdminInsightPoint, IAdminAnalyticsData, IAdminReportsResponse, IAdminReportItem, IReportStatus } from "@/types/admin.types";
import { apiGet, apiPatch, apiDelete } from "./apiClient";

export const realAdminService: IAdminService = {
  getStats: async (): Promise<IAdminStats> => {
    try {
      return await apiGet<IAdminStats>(`${ENV.API_BASE_URL}/admin/stats`);
    } catch {
      return { totalUsers: 0, totalTracks: 0, totalPlays: 0, newUsersToday: 0, newTracksToday: 0, activeUsersThisWeek: 0 };
    }
  },

  getInsights: async (days = 30): Promise<IAdminInsightPoint[]> => {
    try {
      return await apiGet<IAdminInsightPoint[]>(`${ENV.API_BASE_URL}/admin/insights?days=${days}`);
    } catch {
      return [];
    }
  },

  getUsers: async (): Promise<IAdminUser[]> => {
    try {
      return await apiGet<IAdminUser[]>(`${ENV.API_BASE_URL}/admin/users`);
    } catch {
      return [];
    }
  },

  getTracks: async (): Promise<IAdminTrack[]> => {
    try {
      return await apiGet<IAdminTrack[]>(`${ENV.API_BASE_URL}/admin/tracks`);
    } catch {
      return [];
    }
  },

  suspendUser: async (userId: string, _isSuspended?: boolean, _reason?: string): Promise<void> => {
    try {
      await apiPatch(`${ENV.API_BASE_URL}/admin/users/${userId}/suspend`);
    } catch {
      // No-op — not implemented
    }
  },

  getAnalytics: async (): Promise<IAdminAnalyticsData> => {
    try {
      return await apiGet<IAdminAnalyticsData>(`${ENV.API_BASE_URL}/admin/analytics`);
    } catch {
      return {
        totalUsers: 0,
        totalTracks: 0,
        totalComments: 0,
        suspendedUsers: 0,
        activeStreamsToday: 0,
        totalReports: 0,
        openReports: 0,
        underReviewReports: 0,
        resolvedReports: 0,
        dismissedReports: 0,
      };
    }
  },

  getReports: async (params?: { limit?: number; offset?: number }): Promise<IAdminReportsResponse> => {
    try {
      const query = new URLSearchParams();
      if (params?.limit !== undefined) query.set("limit", String(params.limit));
      if (params?.offset !== undefined) query.set("offset", String(params.offset));
      const qs = query.toString() ? `?${query.toString()}` : "";
      return await apiGet<IAdminReportsResponse>(`${ENV.API_BASE_URL}/admin/reports${qs}`);
    } catch {
      return { reports: [], total: 0 };
    }
  },

  reviewReport: async (reportId: string, status: IReportStatus, note?: string): Promise<IAdminReportItem> => {
    return await apiPatch<IAdminReportItem>(`${ENV.API_BASE_URL}/admin/reports/${reportId}`, { status, note });
  },

  deleteTrack: async (trackId: string): Promise<void> => {
    await apiDelete(`${ENV.API_BASE_URL}/admin/tracks/${trackId}`);
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiDelete(`${ENV.API_BASE_URL}/admin/comments/${commentId}`);
  },
};
