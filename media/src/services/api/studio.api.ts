import type {
  IPlaylist,
  IStudioService,
  IStudioTrack,
  IStudioTracksResponse,
} from '@/types/studio.types';
import type { TrackVisibility } from '@/types/upload.types';
import { apiDelete, apiGet, apiPut, apiPost } from './apiClient';
import { ENV } from '@/config/env';

// ── Backend response shapes ───────────────────────────────────────────────────

interface IBackendTrack {
  track_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  tags: string[];
  release_date: string | null;
  cover_image_url: string | null;
  stream_url: string;
  user_id: string;
  visibility: TrackVisibility;
  processing_status: string;
  play_count: number;
  duration_seconds: number | null;
}

interface IBackendTracksResponse {
  user_id: string;
  tracks: IBackendTrack[];
}

interface IBackendPlaylist {
  playlist_id: string;
  title: string;
  cover_image_url?: string | null;
  visibility: TrackVisibility;
  track_count?: number;
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeTrack(raw: IBackendTrack): IStudioTrack {
  return {
    id: raw.track_id,
    title: raw.title,
    genre: raw.genre ?? undefined,
    format: '',
    duration: raw.duration_seconds ?? 0,
    visibility: raw.visibility,
    processingStatus: raw.processing_status as IStudioTrack['processingStatus'],
    plays: raw.play_count,
    likes: 0,
    artworkUrl: raw.cover_image_url ?? undefined,
    createdAt: raw.release_date ?? new Date().toISOString(),
  };
}

function normalizePlaylist(raw: IBackendPlaylist): IPlaylist {
  return {
    id: raw.playlist_id,
    title: raw.title,
    trackCount: raw.track_count ?? 0,
    artworkUrl: raw.cover_image_url ?? undefined,
    visibility: raw.visibility,
  };
}

// ── Username helper ───────────────────────────────────────────────────────────

// async function getUsername(): Promise<string> {
//   const profile = await apiGet<{ username: string }>('/users/me');
//   return profile.username;
// }
async function getUsername(): Promise<string> {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('auth_username');
    // Only use stored value if it looks like a URL slug (no spaces)
    if (stored && !stored.includes(' ')) return stored;
  }

  // Fallback: fetch from API and cache the actual slug field
  const profile = await apiGet<{ username?: string; display_name?: string }>('/users/me');
  const username = profile.username;

  if (!username) throw new Error('Backend /users/me did not return a username slug');

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('auth_username', username);
  }

  return username;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const realStudioService: IStudioService = {
  async getTracks(page: number, pageSize: number): Promise<IStudioTracksResponse> {
    try {
      const username = await getUsername();
      const raw = await apiGet<IBackendTracksResponse | IBackendTrack[]>(
        `${ENV.API_BASE_URL}/users/${username}/tracks`,
      );
      const allTracks = (Array.isArray(raw) ? raw : (raw.tracks ?? [])).map(normalizeTrack);

      // Client-side pagination since backend returns all tracks
      const start = (page - 1) * pageSize;
      const paginated = allTracks.slice(start, start + pageSize);

      return { tracks: paginated, total: allTracks.length, page, pageSize };
    } catch (err) {
      console.warn('Studio getTracks failed, returning empty state:', err);
      return { tracks: [], total: 0, page, pageSize };
    }
  },

  async deleteTrack(trackId: string): Promise<void> {
    await apiDelete(`/tracks/${trackId}`);
  },

  async updateVisibility(trackId: string, visibility: TrackVisibility): Promise<IStudioTrack> {
    const raw = await apiPut<IBackendTrack>(`/tracks/${trackId}`, { visibility });
    return normalizeTrack(raw);
  },

  async bulkEditTracks(): Promise<void> {
    // no-op: no bulk endpoint available yet
    return;
  },

  async getPlaylists(): Promise<IPlaylist[]> {
    try {
      const username = await getUsername();
      const raw = await apiGet<IBackendPlaylist[]>(`${ENV.API_BASE_URL}/users/${username}/playlists`);
      return raw.map(normalizePlaylist);
    } catch (err) {
      console.warn('Studio getPlaylists failed, returning empty state:', err);
      return [];
    }
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    for (const trackId of trackIds) {
      await apiPost(`/playlists/${playlistId}/tracks`, { track_id: trackId });
    }
  },
};