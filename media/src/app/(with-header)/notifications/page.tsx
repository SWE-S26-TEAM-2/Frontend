"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { ENV } from "@/config/env";
import { mockNotificationService } from "@/services/mocks/notification.mock";
import { realNotificationService } from "@/services/api/notification.api";
import type {
  INotification,
  INotificationsResponse,
  IRecentFollower,
  NotificationFilter,
} from "@/types/notification.types";

const notificationService = ENV.USE_MOCK_API
  ? mockNotificationService
  : realNotificationService;

// ── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { label: string; value: NotificationFilter }[] = [
  { label: "All notifications", value: "all"    },
  { label: "Likes",             value: "like"   },
  { label: "Reposts",           value: "repost" },
  { label: "Follows",           value: "follow" },
  { label: "Comments",          value: "comment"},
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(isoDate: string): string {
  const diffMs   = Date.now() - new Date(isoDate).getTime();
  const diffSecs = Math.floor(diffMs / 1_000);
  if (diffSecs < 60)  return `${diffSecs} seconds ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60)  return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  const diffHrs  = Math.floor(diffMins / 60);
  if (diffHrs  < 24)  return `${diffHrs} hour${diffHrs  !== 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHrs  / 24);
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

// Avatar circle with image or coloured initial fallback
function NotificationAvatar({
  username,
  avatarUrl,
  size = 44,
}: {
  username: string;
  avatarUrl: string | null;
  size?: number;
}) {
  // Deterministic colour from username — same user always gets same colour
  const COLOURS = ["#0d6efd","#6f42c1","#d63384","#0dcaf0","#198754","#fd7e14","#dc3545"];
  const colourIndex = username.charCodeAt(0) % COLOURS.length;
  const bg = COLOURS[colourIndex];
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      className="shrink-0 rounded-full overflow-hidden flex items-center justify-center text-white font-bold relative"
      style={{ width: size, height: size, minWidth: size, background: bg }}
    >
      {avatarUrl
        ? <Image src={avatarUrl} alt={username} fill className="object-cover" />
        : <span style={{ fontSize: size * 0.4 }}>{initial}</span>
      }
    </div>
  );
}

// "..." context menu (dismiss / mark read)
function NotificationMenu({
  notificationId,
  onMarkRead,
}: {
  notificationId: string;
  onMarkRead: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[#aaa] hover:text-white hover:bg-white/10 transition-colors bg-transparent border-none cursor-pointer"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5"  cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-9 z-50 min-w-[160px] bg-[#1a1a1a] border border-[#333] rounded shadow-xl py-1">
          <button
            onClick={() => { onMarkRead(notificationId); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 text-[13px] text-[#ccc] hover:bg-white/10 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          >
            Mark as read
          </button>
        </div>
      )}
    </div>
  );
}

// Follow / Unfollow button
function FollowButton({
  actorId,
  isFollowing,
  onToggle,
}: {
  actorId: string;
  isFollowing: boolean;
  onToggle: (actorId: string) => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onToggle(actorId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-5 py-1.5 rounded text-[13px] font-semibold border cursor-pointer transition-colors disabled:opacity-50 ${
        isFollowing
          ? "bg-transparent border-[#555] text-[#ccc] hover:border-[#ff5500] hover:text-[#ff5500]"
          : "bg-transparent border-white text-white hover:bg-white hover:text-black"
      }`}
    >
      {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}

// Single notification row
function NotificationItem({
  notification,
  onMarkRead,
  onToggleFollow,
}: {
  notification: INotification;
  onMarkRead:     (id: string)     => void;
  onToggleFollow: (actorId: string) => Promise<void>;
}) {
  const timeAgo = useMemo(
    () => formatTimeAgo(notification.createdAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notification.createdAt]
  );

  const hasFollowButton =
    notification.type === "follow" ||
    notification.type === "like"   ||
    notification.type === "repost" ||
    notification.type === "comment";

  return (
    <div
      className={`flex items-center gap-4 px-0 py-5 border-b border-[#1e1e1e] transition-colors ${
        !notification.isRead ? "bg-[#0f0f0f]" : ""
      }`}
    >
      {/* Unread dot */}
      <div className="w-2 shrink-0">
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-[#ff5500]" />
        )}
      </div>

      <NotificationAvatar
        username={notification.actor.username}
        avatarUrl={notification.actor.avatarUrl}
      />

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-white leading-snug">
          <span className="font-semibold">{notification.actor.username}</span>
          {" "}
          <span className="text-[#ccc]">{notification.message}</span>
          {notification.trackTitle && (
            <span className="text-[#aaa]"> — <em>{notification.trackTitle}</em></span>
          )}
        </p>
        {notification.commentText && (
          <p className="text-[13px] text-[#888] mt-0.5 truncate">&ldquo;{notification.commentText}&rdquo;</p>
        )}
        <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[#666]">
          {/* Type icon */}
          {notification.type === "like" && (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="#ff5500">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
          {notification.type === "repost" && (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth={2}>
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          )}
          {notification.type === "follow" && (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
          {notification.type === "comment" && (
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth={2}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )}
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {hasFollowButton && (
          <FollowButton
            actorId={notification.actor.id}
            isFollowing={notification.actor.isFollowing}
            onToggle={onToggleFollow}
          />
        )}
        <NotificationMenu
          notificationId={notification.id}
          onMarkRead={onMarkRead}
        />
      </div>
    </div>
  );
}

// Filter dropdown 
function FilterDropdown({
  activeFilter,
  onChange,
}: {
  activeFilter: NotificationFilter;
  onChange: (f: NotificationFilter) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeLabel = FILTER_OPTIONS.find(o => o.value === activeFilter)?.label ?? "All notifications";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-4 py-2 border border-[#444] rounded text-[14px] text-white bg-[#111] hover:border-[#666] transition-colors cursor-pointer"
      >
        {activeLabel}
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-11 z-50 min-w-[200px] bg-[#1a1a1a] border border-[#333] rounded shadow-xl py-1">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[14px] transition-colors bg-transparent border-none cursor-pointer ${
                activeFilter === opt.value
                  ? "text-white font-semibold"
                  : "text-[#ccc] hover:bg-white/10 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Recent followers sidebar card
function RecentFollowerCard({
  follower,
  onToggleFollow,
}: {
  follower: IRecentFollower;
  onToggleFollow: (actorId: string) => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <NotificationAvatar username={follower.username} avatarUrl={follower.avatarUrl} size={40} />
      <span className="flex-1 text-[14px] text-white font-semibold truncate">{follower.username}</span>
      <FollowButton
        actorId={follower.id}
        isFollowing={follower.isFollowing}
        onToggle={onToggleFollow}
      />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [data, setData]               = useState<INotificationsResponse | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");

  // Lazy initialisers — safe in "use client", avoids useEffect setState cascade
  const [nowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    async function fetchNotificationsAsync() {
      try {
        setIsLoading(true);
        const result = await notificationService.getNotifications();
        setData(result);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotificationsAsync(); // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  const filteredNotifications = useMemo(() => {
    if (!data) return [];
    if (activeFilter === "all") return data.notifications;
    return data.notifications.filter(n => n.type === activeFilter);
  }, [data, activeFilter]);

  const handleMarkRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        notifications: prev.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
      };
    });
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        unreadCount: 0,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
      };
    });
  };

  const handleToggleFollow = async (actorId: string) => {
    const result = await notificationService.toggleFollow(actorId);
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: prev.notifications.map(n =>
          n.actor.id === actorId
            ? { ...n, actor: { ...n.actor, isFollowing: result.isFollowing } }
            : n
        ),
        recentFollowers: prev.recentFollowers.map(f =>
          f.id === actorId ? { ...f, isFollowing: result.isFollowing } : f
        ),
      };
    });
  };

  // nowMs used to suppress hydration warning — formatTimeAgo runs client-only
  void nowMs;

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#888] text-sm">Loading...</span>
    </div>
  );

  if (errorMessage || !data) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <span className="text-[#ff5500] text-sm">{errorMessage ?? "Something went wrong"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex gap-12">

          {/* ── Main column ────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Header row */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-[32px] font-bold text-white">Notifications</h1>
              {data.unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[13px] text-[#aaa] hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filter dropdown */}
            <div className="mb-6">
              <FilterDropdown activeFilter={activeFilter} onChange={setActiveFilter} />
            </div>

            {/* Notification list */}
            {filteredNotifications.length === 0 ? (
              <div className="py-20 text-center text-[#555] text-[15px]">
                No {activeFilter === "all" ? "" : activeFilter} notifications yet
              </div>
            ) : (
              <div>
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onToggleFollow={handleToggleFollow}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <aside className="w-72 shrink-0 pt-16">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#888] tracking-widest uppercase">
                Recent Followers
              </span>
              <button className="text-[12px] text-[#aaa] hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                View all
              </button>
            </div>

            {data.recentFollowers.length === 0 ? (
              <p className="text-[13px] text-[#555] mt-4">No recent followers</p>
            ) : (
              <div className="divide-y divide-[#1e1e1e]">
                {data.recentFollowers.map(follower => (
                  <RecentFollowerCard
                    key={follower.id}
                    follower={follower}
                    onToggleFollow={handleToggleFollow}
                  />
                ))}
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
}