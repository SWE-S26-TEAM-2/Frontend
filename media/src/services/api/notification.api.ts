import { apiGet, apiPost, apiPut } from "@/services/api/apiClient";
import { ENV } from "@/config/env";
import type {
  INotificationsResponse,
  INotification,
  IRawNotification,
  IRawNotificationsResponse
} from "@/types/notification.types";

const NOTIFICATIONS_BASE_URL = `${ENV.API_BASE_URL}/notifications`;


function mapType(raw: string): INotification["type"] {
  if (raw === "new_track")     return "new_track";
  if (raw.includes("like"))    return "like";
  if (raw.includes("repost"))  return "repost";
  if (raw.includes("follow"))  return "follow";
  if (raw.includes("comment")) return "comment";
  return "new_track";
}

function extractUsernameFromMessage(message: string, fallback: string): string {
  const firstWord = message.split(" ")[0];
  return firstWord || fallback;
}

function normalizeNotification(raw: IRawNotification): INotification {
  const username = extractUsernameFromMessage(raw.message, raw.actor_id);
  const message = raw.message.startsWith(username)
    ? raw.message.slice(username.length).trim()
    : raw.message;

  return {
    id:        raw.notification_id,
    type:      mapType(raw.notification_type),
    isRead:    raw.is_read,
    createdAt: raw.created_at,
    message,
    actor: {
      id:          raw.actor_id,
      username,
      avatarUrl:   null,
      isFollowing: false,
    },
  };
}

export const realNotificationService = {
async getNotifications(): Promise<INotificationsResponse> {
  const data = await apiGet<IRawNotificationsResponse>(NOTIFICATIONS_BASE_URL);
  const notifications = (data.notifications ?? []).map(normalizeNotification);
  return {
    notifications,
    unreadCount:     notifications.filter(n => !n.isRead).length,
    recentFollowers: [],
  };
},


  async markAllAsRead(): Promise<void> {
    await apiPut<void>(`${NOTIFICATIONS_BASE_URL}/read-all`);
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiPut<void>(`${NOTIFICATIONS_BASE_URL}/${notificationId}/read`);
  },

  async toggleFollow(
    actorUsername: string, 
    currentlyFollowing: boolean,
  ): Promise<{ isFollowing: boolean }> {
    if (currentlyFollowing) {
      await apiPost(`${ENV.API_BASE_URL}/users/${actorUsername}/unfollow`);
    } else {
      await apiPost(`${ENV.API_BASE_URL}/users/${actorUsername}/follow`);
    }
    return { isFollowing: !currentlyFollowing };
  },
};