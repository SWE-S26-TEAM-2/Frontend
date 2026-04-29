import type {
  INotificationsResponse,
  INotification,
  IRecentFollower,
} from "@/types/notification.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const hoursAgo = (h: number): string =>
  new Date(Date.now() - h * 3_600_000).toISOString();

const minutesAgo = (m: number): string =>
  new Date(Date.now() - m * 60_000).toISOString();

// ── Seed data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: "n1",
    type: "follow",
    actor: { id: "u1", username: "sc user", avatarUrl: null, isFollowing: false },
    message: "started following you",
    createdAt: minutesAgo(1),
    isRead: false,
  },
  {
    id: "n2",
    type: "like",
    actor: { id: "u2", username: "MolMol", avatarUrl: null, isFollowing: true },
    message: "liked your track",
    createdAt: minutesAgo(15),
    isRead: false,
    trackTitle: "One Last Time - Ariana Grande",
  },
  {
    id: "n3",
    type: "repost",
    actor: { id: "u3", username: "AmrDiab_fan", avatarUrl: null, isFollowing: false },
    message: "reposted your track",
    createdAt: hoursAgo(1),
    isRead: false,
    trackTitle: "One Last Time - Ariana Grande",
  },
  {
    id: "n4",
    type: "comment",
    actor: { id: "u4", username: "SoundWave99", avatarUrl: null, isFollowing: true },
    message: "commented on your track",
    createdAt: hoursAgo(2),
    isRead: true,
    trackTitle: "One Last Time - Ariana Grande",
    commentText: "This is such a great cover! 🎶",
  },
  {
    id: "n5",
    type: "follow",
    actor: { id: "u5", username: "BeatMaker_X", avatarUrl: null, isFollowing: false },
    message: "started following you",
    createdAt: hoursAgo(5),
    isRead: true,
  },
  {
    id: "n6",
    type: "like",
    actor: { id: "u6", username: "Layla_Music", avatarUrl: null, isFollowing: false },
    message: "liked your track",
    createdAt: hoursAgo(8),
    isRead: true,
    trackTitle: "One Last Time - Ariana Grande",
  },
  {
    id: "n7",
    type: "comment",
    actor: { id: "u7", username: "NadaK", avatarUrl: null, isFollowing: false },
    message: "commented on your track",
    createdAt: hoursAgo(12),
    isRead: true,
    trackTitle: "One Last Time - Ariana Grande",
    commentText: "Amazing taste in music!",
  },
  {
    id: "n8",
    type: "repost",
    actor: { id: "u8", username: "DJ_Khalifa", avatarUrl: null, isFollowing: true },
    message: "reposted your track",
    createdAt: hoursAgo(24),
    isRead: true,
    trackTitle: "One Last Time - Ariana Grande",
  },
];

const MOCK_RECENT_FOLLOWERS: IRecentFollower[] = [
  { id: "u1", username: "sc user", avatarUrl: null, isFollowing: false },
  { id: "u5", username: "BeatMaker_X",  avatarUrl: null, isFollowing: false },
];

// ── In-memory mutable state (simulates real server state) ────────────────────

let mockNotifications = [...MOCK_NOTIFICATIONS];

// ── Mock service ─────────────────────────────────────────────────────────────

export const mockNotificationService = {
  async getNotifications(): Promise<INotificationsResponse> {
    await new Promise(r => setTimeout(r, 300));
    return {
      notifications: [...mockNotifications],
      unreadCount: mockNotifications.filter(n => !n.isRead).length,
      recentFollowers: MOCK_RECENT_FOLLOWERS,
    };
  },

  async markAllAsRead(): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
  },

  async markAsRead(notificationId: string): Promise<void> {
    await new Promise(r => setTimeout(r, 100));
    mockNotifications = mockNotifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
  },

  async toggleFollow(actorId: string): Promise<{ isFollowing: boolean }> {
    await new Promise(r => setTimeout(r, 200));
    let nextIsFollowing = false;
    mockNotifications = mockNotifications.map(n => {
      if (n.actor.id !== actorId) return n;
      nextIsFollowing = !n.actor.isFollowing;
      return { ...n, actor: { ...n.actor, isFollowing: nextIsFollowing } };
    });
    return { isFollowing: nextIsFollowing };
  },
};