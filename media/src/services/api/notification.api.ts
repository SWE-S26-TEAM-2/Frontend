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

function normalizeNotification(raw: IRawNotification): INotification {
  // Message already excludes the actor name duplication
  const username = raw.actor_username ?? raw.actor_id;
  const message = raw.message.startsWith(raw.actor_display_name ?? username)
    ? raw.message.slice((raw.actor_display_name ?? username).length).trim()
    : raw.message;

  return {
    id:        raw.notification_id,
    type:      mapType(raw.notification_type),
    isRead:    raw.is_read,
    createdAt: raw.created_at,
    message,
    actor: {
      id:          raw.actor_id,
      username:    raw.actor_username,
      avatarUrl:   raw.actor_profile_picture,
      isFollowing: false,
    },
  };
}

export const realNotificationService = {
async getNotifications(): Promise<INotificationsResponse> {
  const data = await apiGet<IRawNotificationsResponse>(NOTIFICATIONS_BASE_URL);
  const notifications = (data.notifications ?? []).map(normalizeNotification);
  try {
    const username = typeof window !== "undefined"
      ? window.localStorage.getItem("auth_username") ?? ""
      : "";

    if (username) {
      const followingData = await apiGet<{ following?: { user_id: string }[] }>(
        `${ENV.API_BASE_URL}/users/${username}/following`
      );
      const followingIds = new Set(
        (followingData.following ?? []).map(f => f.user_id)
      );

      return {
        notifications: notifications.map(n => ({
          ...n,
          actor: {
            ...n.actor,
            isFollowing: followingIds.has(n.actor.id),
          },
        })),
        unreadCount:     notifications.filter(n => !n.isRead).length,
        recentFollowers: [],
      };
    }
  } catch {
  }

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