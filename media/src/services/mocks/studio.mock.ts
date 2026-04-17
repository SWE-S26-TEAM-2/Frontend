import type {
  IBulkEditPayload,
  IPlaylist,
  IStudioService,
  IStudioTrack,
  IStudioTracksResponse,
} from '@/types/studio.types';
import type { TrackVisibility } from '@/types/upload.types';
 
const MOCK_TRACKS: IStudioTrack[] = [
  {
    id: 'mock-track-1',
    title: 'Midnight Drive',
    genre: 'Electronic',
    format: 'wav',
    duration: 214,
    visibility: 'public',
    processingStatus: 'finished',
    plays: 1243,
    likes: 87,
    artworkUrl: undefined,
    createdAt: '2025-03-10T12:00:00.000Z',
  },
  {
    id: 'mock-track-2',
    title: 'Lost in the Noise',
    genre: 'Ambient',
    format: 'flac',
    duration: 312,
    visibility: 'public',
    processingStatus: 'finished',
    plays: 542,
    likes: 34,
    artworkUrl: undefined,
    createdAt: '2025-03-18T09:30:00.000Z',
  },
  {
    id: 'mock-track-3',
    title: 'Unfinished Demo',
    genre: 'Indie',
    format: 'mp3',
    duration: 178,
    visibility: 'private',
    processingStatus: 'finished',
    plays: 0,
    likes: 0,
    artworkUrl: undefined,
    createdAt: '2025-03-25T16:45:00.000Z',
  },
  {
    id: 'mock-track-4',
    title: 'New Upload',
    genre: 'Hip-hop & Rap',
    format: 'wav',
    duration: 0,
    visibility: 'private',
    processingStatus: 'processing',
    plays: 0,
    likes: 0,
    artworkUrl: undefined,
    createdAt: '2025-04-01T08:00:00.000Z',
  },
  {
    id: 'mock-track-5',
    title: 'Your Track Title',
    genre: 'Pop',
    format: 'mp3',
    duration: 185,
    visibility: 'public',
    processingStatus: 'finished',
    plays: 320,
    likes: 21,
    artworkUrl: undefined,
    createdAt: '2025-04-01T10:00:00.000Z',
  },
  {
    id: 'mock-track-6',
    title: 'Neon Pulse',
    genre: 'Dance & EDM',
    format: 'wav',
    duration: 198,
    visibility: 'public',
    processingStatus: 'finished',
    plays: 876,
    likes: 54,
    artworkUrl: undefined,
    createdAt: '2025-02-14T18:00:00.000Z',
  },
  {
    id: 'mock-track-7',
    title: 'Broken Signal',
    genre: 'Indie',
    format: 'flac',
    duration: 243,
    visibility: 'private',
    processingStatus: 'finished',
    plays: 12,
    likes: 3,
    artworkUrl: undefined,
    createdAt: '2025-01-05T09:15:00.000Z',
  },
  {
    id: 'mock-track-8',
    title: 'Golden Hour',
    genre: 'R&B & Soul',
    format: 'mp3',
    duration: 267,
    visibility: 'public',
    processingStatus: 'finished',
    plays: 2341,
    likes: 198,
    artworkUrl: undefined,
    createdAt: '2024-12-20T14:30:00.000Z',
  },
];
 
const MOCK_PLAYLISTS: IPlaylist[] = [
  {
    id: 'mock-playlist-1',
    title: 'Late Night Vibes',
    trackCount: 5,
    artworkUrl: undefined,
    visibility: 'public',
  },
  {
    id: 'mock-playlist-2',
    title: 'Work Sessions',
    trackCount: 12,
    artworkUrl: undefined,
    visibility: 'private',
  },
  {
    id: 'mock-playlist-3',
    title: 'Demo Collection',
    trackCount: 0,
    artworkUrl: undefined,
    visibility: 'public',
  },
];
 
// In-memory copy so mutations (delete, visibility) persist during the session
let mockTracks = [...MOCK_TRACKS];
const mockPlaylists = [...MOCK_PLAYLISTS];
 
export const mockStudioService: IStudioService = {
  async getTracks(page: number, pageSize: number): Promise<IStudioTracksResponse> {
    console.log('[MOCK] studioService.getTracks called', { page, pageSize });
    const start = (page - 1) * pageSize;
    const paginated = mockTracks.slice(start, start + pageSize);
    return {
      tracks: paginated,
      total: mockTracks.length,
      page,
      pageSize,
    };
  },
 
  async deleteTrack(trackId: string): Promise<void> {
    console.log('[MOCK] studioService.deleteTrack called', { trackId });
    mockTracks = mockTracks.filter((t) => t.id !== trackId);
  },
 
  async updateVisibility(trackId: string, visibility: TrackVisibility): Promise<IStudioTrack> {
    console.log('[MOCK] studioService.updateVisibility called', { trackId, visibility });
    const track = mockTracks.find((t) => t.id === trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);
    track.visibility = visibility;
    return { ...track };
  },
 
  async bulkEditTracks(trackIds: string[], payload: IBulkEditPayload): Promise<void> {
    console.log('[MOCK] studioService.bulkEditTracks called', { trackIds, payload });
    mockTracks = mockTracks.map((t) => {
      if (!trackIds.includes(t.id)) return t;
      return {
        ...t,
        ...(payload.genre ? { genre: payload.genre } : {}),
        ...(payload.privacy !== 'no-change'
          ? { visibility: payload.privacy as TrackVisibility }
          : {}),
      };
    });
  },
 
  async getPlaylists(): Promise<IPlaylist[]> {
    console.log('[MOCK] studioService.getPlaylists called');
    return [...mockPlaylists];
  },
 
  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    console.log('[MOCK] studioService.addTracksToPlaylist called', { playlistId, trackIds });
    const playlist = mockPlaylists.find((p) => p.id === playlistId);
    if (!playlist) throw new Error(`Playlist ${playlistId} not found`);
    playlist.trackCount += trackIds.length;
  },
};