import type {
  IPlaylist,
  IStudioService,
  IStudioTrack,
  IStudioTracksResponse,
} from '@/types/studio.types';
import type { TrackVisibility } from '@/types/upload.types';
import { apiDelete, apiGet, apiPut, apiPost } from './apiClient';

export const realStudioService: IStudioService = {
  async getTracks(): Promise<IStudioTracksResponse> {
    // No backend listing endpoint yet — this service is hardcoded to mock in di.ts.
    throw new Error('getTracks: no backend endpoint implemented');
  },

  async deleteTrack(trackId: string): Promise<void> {
    await apiDelete(`/tracks/${trackId}`);
  },

  async updateVisibility(trackId: string, visibility: TrackVisibility): Promise<IStudioTrack> {
    return apiPut<IStudioTrack>(`/tracks/${trackId}`, {
      is_private: visibility === 'private',
    });
  },

  async bulkEditTracks(): Promise<void> {
    // No backend bulk endpoint yet — this service is hardcoded to mock in di.ts.
    throw new Error('bulkEditTracks: no backend endpoint implemented');
  },

  async getPlaylists(): Promise<IPlaylist[]> {
    return apiGet<IPlaylist[]>('/playlists/liked');
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    // Backend accepts one track_id per request — fire sequentially.
    for (const trackId of trackIds) {
      await apiPost(`/playlists/${playlistId}/tracks`, { track_id: trackId });
    }
  },
};
