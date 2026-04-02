 
import type {
  IUploadQuota,
  IUploadResponse,
  IUploadService,
  IUploadTrackPayload,
} from '@/types/upload.types';
 
const MOCK_QUOTA: IUploadQuota = {
  usedMinutes: 0,
  totalMinutes: 120,
  usedPercentage: 0,
  isUnlimited: false,
};
 
export const mockUploadService: IUploadService = {
  async getQuota(): Promise<IUploadQuota> {
    console.log('[MOCK] getQuota called');  // check
    await new Promise((r) => setTimeout(r, 300));  
    return { ...MOCK_QUOTA };
  },
 
  async uploadTrack(
    file: File,
    payload: IUploadTrackPayload,
    onProgress: (progress: number) => void
  ): Promise<IUploadResponse> {
    // Simulate upload progress
    console.log('[MOCK] uploadTrack called', { file, payload });  //check
    await new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(Math.min(progress, 100));
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
 
    return {
      trackId: `mock-track-${Date.now()}`,
      title: payload.title || file.name.replace(/\.[^/.]+$/, ''),
      streamUrl: 'https://mock.soundcloud.com/stream/mock-track',
      artworkUrl: undefined,
      createdAt: new Date().toISOString(),
    };
  },
};