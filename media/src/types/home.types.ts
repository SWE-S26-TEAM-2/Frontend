// @/types/home.types.ts
import { ITrack } from './track.types'; // Import from your first file


export interface RecentItem extends ITrack {
  playedAt?: string;
  type: 'track' | 'artist'; // Make sure this is explicit
  name?: string;            // Add this as optional
  followers?: string;       // Add this as optional
}


export interface IArtist {
  id: string;
  name: string;
  followers: string;
  tracksCount: number;
  imageUrl: string;
  type: 'artist'; 
}

export interface IHomePageData {
  moreOfWhatYouLike: ITrack[];     // Uses the master ITrack
  recentlyPlayed: RecentItem[];   // Uses the master ITrack + playedAt
  mixedForUser: ITrack[];
  discoverStations: ITrack[];
  followSuggestions: IArtist[];
  listeningHistory: ITrack[];
}