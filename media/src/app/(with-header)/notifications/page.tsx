"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { activityNotificationService } from "@/services/di";
import { useAuthStore } from "@/store/authStore";
import { timeAgo } from "@/utils/timeAgo";
import type { INotification, INotificationType } from "@/types/notification.types";

const FILTERS: { value: INotificationType | "all"; label: string }[] = [
  { value: "all",     label: "All" },
  { value: "like",    label: "Likes" },
  { value: "comment", label: "Comments" },
  { value: "follow",  label: "Follows" },
  { value: "repost",  label: "Reposts" },
  { value: "mention", label: "Mentions" },
];

const TYPE_ICONS: Record<INotificationType, string> = {
  like:    "♥",
  follow:  "👤",
  repost:  "🔁",
  comment: "💬",
  mention: "@",
};

const TYPE_COLORS: Record<INotificationType, string> = {
  like:    "text-red-400",
  follow:  "text-blue-400",
  repost:  "text-green-400",
  comment: "text-yellow-400",
  mention: "text-purple-400",
};

function groupByTime(notifications: INotification[]): { label: string; items: INotification[] }[] {
  const now = Date.now();
  const day = 86400000;
  const week = 7 * day;
  const groups: Record<string, INotification[]> = { Today: [], "This week": [], Earlier: [] };

  for (const n of notifications) {
    const diff = now - new Date(n.createdAt).getTime();
    if (diff < day) groups["Today"].push(n);
    else if (diff < week) groups["This week"].push(n);
    else groups["Earlier"].push(n);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function NotifSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-(--sc-bg-elevated) animate-pulse">
          <div className="w-10 h-10 rounded-full bg-(--sc-bg)" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-(--sc-bg) rounded w-64" />
            <div className="h-2 bg-(--sc-bg) rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [filter, setFilter] = useState<INotificationType | "all">("all");
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;
    startTransition(async () => {
      const data = await activityNotificationService.getNotifications(filter);
      setNotifications(data);
    });
  }, [filter, isLoggedIn]);

  const handleMarkAllRead = async () => {
    await activityNotificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string) => {
    await activityNotificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groups = groupByTime(notifications);

  if (!isLoggedIn) return null;

  return (
    <div className="bg-(--sc-bg) min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-6 pb-28">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-(--sc-text)">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-(--sc-text-muted)">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === value
                  ? "bg-orange-500 text-white"
                  : "bg-(--sc-bg-elevated) text-(--sc-text-muted) hover:text-(--sc-text)"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isPending ? (
          <NotifSkeleton />
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-(--sc-text-muted)">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ label, items }) => (
              <div key={label}>
                <h3 className="text-xs uppercase tracking-widest font-semibold text-(--sc-text-muted) mb-2">{label}</h3>
                <div className="space-y-1">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                        n.isRead ? "hover:bg-(--sc-bg-elevated)" : "bg-orange-500/5 hover:bg-orange-500/10"
                      }`}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                    >
                      {/* Actor avatar */}
                      <div className="relative flex-shrink-0">
                        {n.actor.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={n.actor.avatarUrl}
                            alt={n.actor.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-(--sc-bg-elevated) flex items-center justify-center text-(--sc-text-muted) font-bold">
                            {n.actor.username[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className={`absolute -bottom-0.5 -right-0.5 text-[11px] ${TYPE_COLORS[n.type]}`}>
                          {TYPE_ICONS[n.type]}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-(--sc-text) leading-snug">
                          <Link href={`/${n.actor.id}`} className="font-semibold hover:text-orange-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                            {n.actor.username}
                          </Link>{" "}
                          {n.message}
                          {n.track && (
                            <>
                              {" "}
                              <Link href={`/track/${n.track.id}`} className="font-medium text-orange-400/80 hover:text-orange-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                                {n.track.title}
                              </Link>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-(--sc-text-muted) mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
