/**
 * src/types/studio.types.ts
 *
 * Type definitions for the Creator Studio feature.
 * Covers track management, playlist management, and bulk editing.
 */

import type { TrackVisibility } from './upload.types';

// ── Studio Tabs ───────────────────────────────────────────────────────────────

export type StudioTab = 'tracks' | 'distribution' | 'vinyl' | 'comments' | 'promotions';

// ── Studio Stats ──────────────────────────────────────────────────────────────

export interface IStudioStats {
  scPlays: number;
  reposts: number;
  downloads: number;
  likes: number;
  comments: number;
}

// ── Bulk Privacy Option ───────────────────────────────────────────────────────

export type BulkPrivacyOption = 'public' | 'private' | 'no-change';

// ── Studio Track ──────────────────────────────────────────────────────────────

export interface IStudioTrack {
  id: string;
  title: string;
  genre: string;
  format: string;
  duration: number; // seconds
  visibility: TrackVisibility;
  processingStatus: 'processing' | 'finished' | 'error';
  plays: number;
  likes: number;
  artworkUrl?: string;
  createdAt: string; // ISO 8601
}

export interface IStudioTracksResponse {
  tracks: IStudioTrack[];
  total: number;
  page: number;
  pageSize: number;
}

// ── Studio Playlist ───────────────────────────────────────────────────────────

export interface IPlaylist {
  id: string;
  title: string;
  trackCount: number;
  artworkUrl?: string;
  visibility: TrackVisibility;
}

// ── Bulk Edit ─────────────────────────────────────────────────────────────────

export interface IBulkEditPayload {
  genre?: string;
  privacy: TrackVisibility | 'no-change';
  tags?: string[];
  artwork?: File;
}

// ── Service Interface ─────────────────────────────────────────────────────────

export interface IStudioService {
  getTracks(page: number, pageSize: number): Promise<IStudioTracksResponse>;
  deleteTrack(trackId: string): Promise<void>;
  updateVisibility(trackId: string, visibility: TrackVisibility): Promise<IStudioTrack>;
  bulkEditTracks(trackIds: string[], payload: IBulkEditPayload): Promise<void>;
  getPlaylists(): Promise<IPlaylist[]>;
  addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void>;
}
