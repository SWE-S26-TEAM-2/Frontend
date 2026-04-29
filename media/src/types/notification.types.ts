// ── Notification type discriminator ─────────────────────────────────────────

export type INotificationType = "like" | "repost" | "follow" | "comment"| "new_track";

export type INotificationFilter = "all" | INotificationType;

// ── Core notification shape ──────────────────────────────────────────────────

export interface INotificationActor {
  id: string;
  username: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface INotification {
  id: string;
  type: INotificationType;
  actor: INotificationActor;
  message: string;
  createdAt: string;
  isRead: boolean;
  trackTitle?: string;
  commentText?: string;
}

// ── Recent follower (sidebar) ────────────────────────────────────────────────

export interface IRecentFollower {
  id: string;
  username: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

// ── Service response shapes ──────────────────────────────────────────────────

export interface INotificationsResponse {
  notifications: INotification[];
  unreadCount: number;
  recentFollowers: IRecentFollower[];
}

export interface IRawNotification {
  notification_id: string;
  actor_id: string;
  notification_type: string;
  target_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface IRawNotificationsResponse {
  notifications: IRawNotification[];
}