import type {
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
};