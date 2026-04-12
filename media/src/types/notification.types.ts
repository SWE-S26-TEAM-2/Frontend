import { ITrack } from "./track.types";

export type INotificationType =
  | "like"
  | "follow"
  | "repost"
  | "comment"
  | "mention";

export interface INotificationActor {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface INotification {
  id: string;
  type: INotificationType;
  actor: INotificationActor;
  track?: Pick<ITrack, "id" | "title" | "albumArt">; // target track (if applicable)
  message: string;           // pre-built human-readable string
  isRead: boolean;
  createdAt: string;
}

export interface INotificationService {
  getNotifications: (filter?: INotificationType | "all") => Promise<INotification[]>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
}
