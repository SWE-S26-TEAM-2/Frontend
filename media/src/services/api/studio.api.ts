import type {
  IBulkEditPayload,
  IPlaylist,
  IStudioService,
  IStudioTrack,
  IStudioTracksResponse,
} from '@/types/studio.types';
import type { TrackVisibility } from '@/types/upload.types';
 
export const realStudioService: IStudioService = {
  async getTracks(page: number, pageSize: number): Promise<IStudioTracksResponse> {
    const res = await fetch(`/api/users/me/tracks?page=${page}&pageSize=${pageSize}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch studio tracks');
    return res.json();
  },
 
  async deleteTrack(trackId: string): Promise<void> {
    const res = await fetch(`/api/tracks/${trackId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to delete track ${trackId}`);
  },
 
  async updateVisibility(trackId: string, visibility: TrackVisibility): Promise<IStudioTrack> {
    const res = await fetch(`/api/tracks/${trackId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPrivate: visibility === 'private' }),
    });
    if (!res.ok) throw new Error(`Failed to update visibility for track ${trackId}`);
    return res.json();
  },
 
  async bulkEditTracks(trackIds: string[], payload: IBulkEditPayload): Promise<void> {
    const formData = new FormData();
    formData.append('trackIds', JSON.stringify(trackIds));
    formData.append('privacy', payload.privacy);
    if (payload.genre) formData.append('genre', payload.genre);
    if (payload.tags) formData.append('tags', JSON.stringify(payload.tags));
    if (payload.artwork) formData.append('artwork', payload.artwork);
 
    const res = await fetch('/api/tracks/bulk', {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to bulk edit tracks');
  },
 
  async getPlaylists(): Promise<IPlaylist[]> {
    const res = await fetch('/api/users/me/playlists', {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch playlists');
    return res.json();
  },
 
  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackIds }),
    });
    if (!res.ok) throw new Error(`Failed to add tracks to playlist ${playlistId}`);
  },
};