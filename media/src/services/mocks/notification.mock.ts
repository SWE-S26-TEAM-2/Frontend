import { MOCK_NOTIFICATIONS } from "./mockData";
import type { INotification, INotificationService, INotificationType } from "@/types/notification.types";

let notifStore = [...MOCK_NOTIFICATIONS];

export const mockNotificationService: INotificationService = {
  getNotifications: async (filter: INotificationType | "all" = "all"): Promise<INotification[]> => {
    await new Promise((r) => setTimeout(r, 300));
    if (filter === "all") return notifStore;
    return notifStore.filter((n) => n.type === filter);
  },

  markAllRead: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 200));
    notifStore = notifStore.map((n) => ({ ...n, isRead: true }));
  },

  markRead: async (id: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 150));
    notifStore = notifStore.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  },
};
