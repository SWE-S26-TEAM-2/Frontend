import type { AudioFormat, TrackVisibility } from './upload.types';
 
export type TrackProcessingStatus = 'processing' | 'finished' | 'error';
 
export interface IStudioTrack {
  id: string;
  title: string;
  genre: string;
  format: AudioFormat;
  duration: number; // in seconds
  visibility: TrackVisibility;
  processingStatus: TrackProcessingStatus;
  plays: number;
  likes: number;
  artworkUrl?: string;
  createdAt: string;
}
 
export interface IStudioTracksResponse {
  tracks: IStudioTrack[];
  total: number;
  page: number;
  pageSize: number;
}
 
export interface IStudioStats {
  scPlays: number;
  reposts: number;
  downloads: number;
  likes: number;
  comments: number;
}
 
// ── Playlist ──────────────────────────────────────────────────────────────────
 
export interface IPlaylist {
  id: string;
  title: string;
  trackCount: number;
  artworkUrl?: string;
  visibility: TrackVisibility;
}
 
// ── Bulk edit ─────────────────────────────────────────────────────────────────
 
export type BulkPrivacyOption = 'no-change' | 'public' | 'private';
 
export interface IBulkEditPayload {
  genre?: string;
  tags?: string[];
  artwork?: File;
  privacy: BulkPrivacyOption;
}
 
// ── Service ───────────────────────────────────────────────────────────────────
 
export interface IStudioService {
  getTracks(page: number, pageSize: number): Promise<IStudioTracksResponse>;
  deleteTrack(trackId: string): Promise<void>;
  updateVisibility(trackId: string, visibility: TrackVisibility): Promise<IStudioTrack>;
  bulkEditTracks(trackIds: string[], payload: IBulkEditPayload): Promise<void>;
  getPlaylists(): Promise<IPlaylist[]>;
  addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void>;
}