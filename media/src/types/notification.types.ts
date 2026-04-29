// ── Notification type discriminator ─────────────────────────────────────────

export type NotificationType = "like" | "repost" | "follow" | "comment";

export type NotificationFilter = "all" | NotificationType;

// ── Core notification shape ──────────────────────────────────────────────────

export interface INotificationActor {
  id: string;
  username: string;
  avatarUrl: string | null;
  /** Whether the current user already follows this actor */
  isFollowing: boolean;
}

export interface INotification {
  id: string;
  type: NotificationType;
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