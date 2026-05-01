import { ITrack } from "./track.types";

export type IFeedActivityType = "track" | "repost" | "like" | "follow";

export interface IFeedUser {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface IFeedItem {
  id: string;
  type: IFeedActivityType;
  actor: IFeedUser;          // who performed the action
  track?: ITrack;            // track involved (all types except 'follow')
  followedUser?: IFeedUser;  // only for type === 'follow'
  createdAt: string;         // ISO timestamp
}

export interface IFeedService {
  getFeed: (filter?: "all" | "tracks" | "reposts") => Promise<IFeedItem[]>;
}
