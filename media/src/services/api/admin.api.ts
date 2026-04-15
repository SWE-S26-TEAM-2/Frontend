import { ENV } from "@/config/env";
import type { IAdminService, IAdminUser, IAdminTrack, IAdminStats, IAdminInsightPoint } from "@/types/admin.types";
import { apiGet, apiPatch } from "./apiClient";

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

  suspendUser: async (userId: string): Promise<void> => {
    try {
      await apiPatch(`${ENV.API_BASE_URL}/admin/users/${userId}/suspend`);
    } catch {
      // No-op — not implemented
    }
  },
};
