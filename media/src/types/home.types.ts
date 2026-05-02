  import { IStation } from "./station.types";
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
    discoverStations: IStation[];
    followSuggestions: IArtist[];
    listeningHistory: ITrack[];
  }

  export interface IHomeService {
    getHomePageData(username?: string): Promise<IHomePageData>;
    refreshFollowSuggestions(): Promise<IArtist[]>;
  }

  
export interface IRawRecentlyPlayedItem {
  history_id: string;
  played_at: string;
  duration_listened_seconds: number;
  track: {
    track_id: string;
    title: string;
    description: string | null;
    cover_image_url: string | null;
    stream_url: string | null;
    duration_seconds: number | null;
    play_count: number;
  };
}

