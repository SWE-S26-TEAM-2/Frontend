import { ENV } from "@/config/env";
import type { IAdminService, IAdminUser, IAdminTrack, IAdminStats, IAdminInsightPoint } from "@/types/admin.types";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const realAdminService: IAdminService = {
  getStats: async (): Promise<IAdminStats> => {
    const res = await fetch(`${ENV.API_BASE_URL}/admin/stats`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return res.json();
  },

  getInsights: async (days = 30): Promise<IAdminInsightPoint[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/admin/insights?days=${days}`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch insights");
    return res.json();
  },

  getUsers: async (): Promise<IAdminUser[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/admin/users`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch admin users");
    return res.json();
  },

  getTracks: async (): Promise<IAdminTrack[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/admin/tracks`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch admin tracks");
    return res.json();
  },

  suspendUser: async (userId: string): Promise<void> => {
    await fetch(`${ENV.API_BASE_URL}/admin/users/${userId}/suspend`, {
      method: "PATCH",
      headers: authHeaders(),
    });
  },
};
