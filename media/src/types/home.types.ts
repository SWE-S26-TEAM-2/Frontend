import { ITrack } from './track.types';

export interface IArtist {
  id: string;
  name: string;
  followers: string;
  tracksCount: number;
  imageUrl: string;
  type: 'artist'; 
}

// Discriminated Union: This is the key to removing (any)
export type IRecentItem = 
  | (ITrack & { type: 'track'; playedAt?: string }) 
  | (IArtist & { type: 'artist'; playedAt?: string });

export interface IToolItem {
  icon: React.ReactNode;
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