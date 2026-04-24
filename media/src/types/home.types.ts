import { ITrack } from "./track.types";
import type { ReactNode } from "react";

export interface IArtist {
  id: string;
  name: string;
  followers: string;
  tracksCount: number;
  imageUrl: string;
  type: "artist";
}

export type IRecentItem =
  | (ITrack & { type: "track"; playedAt?: string })
  | (IArtist & { type: "artist"; playedAt?: string });

export interface IToolItem {
  icon: ReactNode;
  label: string;
  isGold?: boolean;
}

export interface IRightSidebarProps {
  followSuggestions: IArtist[];
  listeningHistory: ITrack[];
}

export interface IHomePageData {
  moreOfWhatYouLike: ITrack[];
  recentlyPlayed: IRecentItem[];
  mixedForUser: ITrack[];
  discoverStations: ITrack[];
  followSuggestions: IArtist[];
  listeningHistory: ITrack[];
}

export interface IHomeService {
  getHomePageData(username?: string): Promise<IHomePageData>;
  refreshFollowSuggestions(): Promise<IArtist[]>;
}