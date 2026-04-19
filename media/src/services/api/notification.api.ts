import { ENV } from "@/config/env";
import type { INotification, INotificationService, INotificationType } from "@/types/notification.types";
import { apiGet, apiPatch } from "./apiClient";

export const realNotificationService: INotificationService = {
  getNotifications: async (filter: INotificationType | "all" = "all"): Promise<INotification[]> => {
    return await apiGet<INotification[]>(`${ENV.API_BASE_URL}/notifications?filter=${filter}`);
  },

  markAllRead: async (): Promise<void> => {
    await apiPatch(`${ENV.API_BASE_URL}/notifications/read-all`);
  },

  markRead: async (id: string): Promise<void> => {
    await apiPatch(`${ENV.API_BASE_URL}/notifications/${id}/read`);
  },
};
