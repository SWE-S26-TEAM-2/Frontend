 
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
    // Sentinel network call so Playwright page.route('**/api/tracks**') can
    // count upload attempts AND simulate failure modes in mock mode without
    // depending on console output. The default in real-browser mock runs is
    // a network error (no handler), which is caught silently below; tests
    // that *want* to force a failure can intercept and return non-2xx.
    if (typeof window !== 'undefined') {
      let mockSentinelStatus: number | null = null;
      try {
        const sentinel = await fetch('/api/tracks', {
          method: 'POST',
          headers: { 'x-mock-upload': '1' },
        });
        mockSentinelStatus = sentinel.status;
      } catch {
        // Network error (default): no handler intercepted. Treat as success
        // so existing mock tests are not affected.
        mockSentinelStatus = null;
      }
      // Only treat 5xx as a forced failure trigger. 4xx (including the 404
      // Next.js returns when no test is intercepting /api/tracks) must NOT
      // break the happy-path mock tests.
      if (mockSentinelStatus !== null && mockSentinelStatus >= 500) {
        throw new Error(`Mock upload forced-failure status=${mockSentinelStatus}`);
      }
    }
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