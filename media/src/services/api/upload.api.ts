 
import type {
  IUploadQuota,
  IUploadResponse,
  IUploadService,
  IUploadTrackPayload,
} from '@/types/upload.types';
 
export const realUploadService: IUploadService = {
  async getQuota(): Promise<IUploadQuota> {
    const res = await fetch('/api/users/me/quota', {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch upload quota');
    return res.json();
  },
 
  async uploadTrack(
    file: File,
    payload: IUploadTrackPayload,
    onProgress: (progress: number) => void
  ): Promise<IUploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', payload.title);
      if (payload.description) formData.append('description', payload.description);
      if (payload.genre) formData.append('genre', payload.genre);
      if (payload.tags) formData.append('tags', JSON.stringify(payload.tags));
      if (payload.isPrivate !== undefined)
        formData.append('isPrivate', String(payload.isPrivate));
      if (payload.artwork) formData.append('artwork', payload.artwork);
 
      const xhr = new XMLHttpRequest();
 
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
 
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
 
      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
 
      xhr.open('POST', '/api/tracks');
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  },
};