import { ENV } from "@/config/env";
import type { INotification, INotificationService, INotificationType } from "@/types/notification.types";
import { apiGet, apiPatch } from "./apiClient";

export const realNotificationService: INotificationService = {
  getNotifications: async (filter: INotificationType | "all" = "all"): Promise<INotification[]> => {
    try {
      return await apiGet<INotification[]>(`${ENV.API_BASE_URL}/notifications?filter=${filter}`);
    } catch {
      // Backend has no notifications endpoint yet — return empty
      return [];
    }
  },

  markAllRead: async (): Promise<void> => {
    try {
      await apiPatch(`${ENV.API_BASE_URL}/notifications/read-all`);
    } catch {
      // No-op — not implemented
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await apiPatch(`${ENV.API_BASE_URL}/notifications/${id}/read`);
    } catch {
      // No-op — not implemented
    }
  },
};
