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

export interface ITrack {
  id: string;

  // Basic info
  title: string;
  artist: string; // keep as string for now (API may change later)
  albumArt: string;
  genre?: string;
  description?: string;

  // Audio
  url: string;
  duration: number; // seconds

  // Stats
  likes: number;
  plays: number;
  commentsCount?: number;

  // UI state (frontend only)
  isLiked?: boolean;

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