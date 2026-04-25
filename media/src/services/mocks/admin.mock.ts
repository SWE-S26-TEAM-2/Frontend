import { MOCK_ADMIN_USERS, MOCK_ADMIN_TRACKS, MOCK_ADMIN_STATS, MOCK_ADMIN_INSIGHTS } from "./mockData";
import type { IAdminService, IAdminUser, IAdminTrack, IAdminStats, IAdminInsightPoint } from "@/types/admin.types";

let userStore = [...MOCK_ADMIN_USERS];

export const mockAdminService: IAdminService = {
  getStats: async (): Promise<IAdminStats> => {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_ADMIN_STATS;
  },

  getInsights: async (days = 30): Promise<IAdminInsightPoint[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_ADMIN_INSIGHTS.slice(-days);
  },

  getUsers: async (): Promise<IAdminUser[]> => {
    await new Promise((r) => setTimeout(r, 350));
    return userStore;
  },

  getTracks: async (): Promise<IAdminTrack[]> => {
    await new Promise((r) => setTimeout(r, 350));
    return MOCK_ADMIN_TRACKS;
  },

  suspendUser: async (userId: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 300));
    userStore = userStore.map((u) =>
      u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u
    );
  },
};
