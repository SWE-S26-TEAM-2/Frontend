/**
 * Track types following standardized API patterns
 */

export interface ITrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  url: string;
  genre?: string;
  likes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITrackListResponse {
  items: ITrack[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Export non-prefixed alias for convenience
export type TrackListResponse = ITrackListResponse;