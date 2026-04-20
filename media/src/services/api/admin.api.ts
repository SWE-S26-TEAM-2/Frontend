import { ENV } from "@/config/env";
import type { IAdminInsightPoint, IAdminService, IAdminStats, IAdminTrack, IAdminUser } from "@/types/admin.types";
import { apiGet, apiPatch } from "./apiClient";

export const realAdminService: IAdminService = {
  getStats: async (): Promise<IAdminStats> => {
    return await apiGet<IAdminStats>(`${ENV.API_BASE_URL}/admin/stats`);
  },

  getInsights: async (days = 30): Promise<IAdminInsightPoint[]> => {
    return await apiGet<IAdminInsightPoint[]>(`${ENV.API_BASE_URL}/admin/insights?days=${days}`);
  },

  getUsers: async (): Promise<IAdminUser[]> => {
    return await apiGet<IAdminUser[]>(`${ENV.API_BASE_URL}/admin/users`);
  },

  getTracks: async (): Promise<IAdminTrack[]> => {
    return await apiGet<IAdminTrack[]>(`${ENV.API_BASE_URL}/admin/tracks`);
  },

  suspendUser: async (userId: string): Promise<void> => {
    await apiPatch(`${ENV.API_BASE_URL}/admin/users/${userId}/suspend`);
  },
};
