import { apiGet, apiPost } from "@/services/api/apiClient";
import { ENV } from "@/config/env";
import type {
  INotificationsResponse,
} from "@/types/notification.types";

const BASE = `${ENV.API_BASE_URL}/notifications`;

export const realNotificationService = {
  async getNotifications(): Promise<INotificationsResponse> {
    return apiGet<INotificationsResponse>(BASE);
  },

  async markAllAsRead(): Promise<void> {
    await apiPost<void>(`${BASE}/mark-all-read`);
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiPost<void>(`${BASE}/${notificationId}/read`);
  },

  async toggleFollow(actorId: string): Promise<{ isFollowing: boolean }> {
    return apiPost<{ isFollowing: boolean }>(`${ENV.API_BASE_URL}/users/${actorId}/follow`);
  },
};