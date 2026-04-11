/**
 * Track types following standardized API patterns.
 *
 * Architecture note:
 *  ITrackBase — minimum shared shape used by both ITrack and IPlaylistTrack.
 *               Contains only the fields that every track-like entity must have.
 *  ITrack     — full track entity (stats, timestamps) used by main components.
 *               Extends ITrackBase — zero breaking changes to existing consumers.
 *
 * Both ITrackBase consumers remain fully type-safe.
 * IPlaylistTrack (in playlist.types.ts) also extends ITrackBase.
 */

// ── Shared base ───────────────────────────────────────────────────────────────

/**
 * Minimum fields shared by ITrack and IPlaylistTrack.
 * Do NOT add optional fields here that only one consumer needs.
 */
export interface ITrackBase {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  url: string;
  duration: number;
}

// ── Full track entity ─────────────────────────────────────────────────────────

export interface ITrack extends ITrackBase {
  // Extended info
  genre?: string;
  description?: string;

  // Stats (required — present in all API responses)
  likes: number;
  plays: number;
  commentsCount?: number;

  // UI state (frontend only)
  isLiked?: boolean;

  // Timestamps (required)
  createdAt: string;
  updatedAt: string;
}

// ── Component prop interfaces ─────────────────────────────────────────────────

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

// ── Track comment ─────────────────────────────────────────────────────────────

export interface ITrackComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

// ── Service interface ─────────────────────────────────────────────────────────

export interface ITrackService {
  getAll(): Promise<ITrack[]>;
  getAllPaginated(page?: number, pageSize?: number): Promise<ITrackListResponse>;
  getById(id: string): Promise<ITrack>;
  getByGenre(genre: string): Promise<ITrack[]>;
  search(query: string): Promise<ITrack[]>;
  getTrending(limit?: number): Promise<ITrack[]>;
  getRelated(trackId: string, limit?: number): Promise<ITrack[]>;
}

// ── List response ─────────────────────────────────────────────────────────────

export interface ITrackListResponse {
  items: ITrack[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Export non-prefixed alias for convenience
export type TrackListResponse = ITrackListResponse;