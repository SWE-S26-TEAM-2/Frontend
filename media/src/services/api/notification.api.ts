import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api/apiClient";
import { ENV } from "@/config/env";
import type {
  INotificationsResponse,
  INotification,
  IRawNotification,
  IRawNotificationsResponse,
  INotificationService,
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

export const realNotificationService: INotificationService = {
  async getNotifications(): Promise<INotificationsResponse> {
    const data = await apiGet<IRawNotificationsResponse>(NOTIFICATIONS_BASE_URL);
    const notifications = (data.notifications ?? []).map(normalizeNotification);

    try {
      // Bug 7 note: following list uses /users/me/following (authenticated user's own
      // list) — not /users/{username}/following which is for viewing another user's list.
      const followingData = await apiGet<{
        data?: { following?: { user_id: string }[] };
        following?: { user_id: string }[];
      }>(`${ENV.API_BASE_URL}/users/me/following`);

      const followingIds = new Set(
        (followingData.data?.following ?? followingData.following ?? []).map(f => f.user_id)
      );

      return {
        notifications: notifications.map(n => ({
          ...n,
          actor: { ...n.actor, isFollowing: followingIds.has(n.actor.id) },
        })),
        unreadCount:     notifications.filter(n => !n.isRead).length,
        recentFollowers: [],
      };
    } catch {
      // If following fetch fails, return notifications without isFollowing state.
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
      await apiDelete(`${ENV.API_BASE_URL}/users/${actorUsername}/follow`);
    } else {
      await apiPost(`${ENV.API_BASE_URL}/users/${actorUsername}/follow`);
    }
    return { isFollowing: !currentlyFollowing };
  },
};