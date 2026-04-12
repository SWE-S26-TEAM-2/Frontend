import { ENV } from "@/config/env";
import type { INotification, INotificationService, INotificationType } from "@/types/notification.types";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const realNotificationService: INotificationService = {
  getNotifications: async (filter: INotificationType | "all" = "all"): Promise<INotification[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/notifications?filter=${filter}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
  },

  markAllRead: async (): Promise<void> => {
    await fetch(`${ENV.API_BASE_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: authHeaders(),
    });
  },

  markRead: async (id: string): Promise<void> => {
    await fetch(`${ENV.API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });
  },
};
