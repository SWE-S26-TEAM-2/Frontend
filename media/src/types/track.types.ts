/**
 * Track types following standardized API patterns
 */

export interface IRelatedTracksProps {
  tracks: ITrack[];
  sourceTrack?: ITrack;
}

export interface ITrackCardProps {
  track: ITrack;
  onPlay: (track: ITrack) => void;
  onLikeChange?: (trackId: string, isLiked: boolean, likeCount: number) => void;
  isOwner?: boolean;
  onDelete?: (trackId: string) => void;
} 

export interface ITrackCoverProps {
  url?: string | null;
  size?: number;
  accentColor?: string;
  alt?: string;
}

export interface IWaveformProps {
  data: number[];
  height?: number;
  playedPercent?: number;
  onSeek?: (percent: number) => void;
  playedColor?: string;
  unplayedColor?: string;
}

export interface ITrackBase {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  url: string;
  duration: number;
}

export interface ITrack extends ITrackBase {
  commentsCount?: number;
  reposts?: number;  
  isReposted?: boolean;

  // UI state (frontend only)
  isLiked?: boolean;

  // Stats
  genre?: string;
  likes?: number;
  plays?: number;
  description?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ITrackComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface ITrackService {
  getAll(): Promise<ITrack[]>;

  getAllPaginated(
    page?: number,
    pageSize?: number
  ): Promise<ITrackListResponse>;

  getById(id: string): Promise<ITrack>;

  getByGenre(genre: string): Promise<ITrack[]>;

  search(query: string): Promise<ITrack[]>;

  getTrending(limit?: number): Promise<ITrack[]>;

  getRelated(trackId: string, limit?: number): Promise<ITrack[]>;
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