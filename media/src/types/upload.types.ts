 
export type UploadStatus =
  | 'idle'
  | 'dragging'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'error';
 
export type UploadStep = 'select' | 'metadata' | 'success';

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'aiff' | 'alac' | 'ogg' | string;
 
export type TrackVisibility = 'public' | 'private';

export interface IUploadQuota {
  usedMinutes: number;
  totalMinutes: number;
  usedPercentage: number;
  isUnlimited: boolean;
}

export interface IUploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  format: AudioFormat;
  status: UploadStatus;
  progress: number; // 0–100
  errorMessage?: string;
  trackId?: string; // populated after successful upload
}
 
export interface ITrackMetadata {
  title: string;
  trackLink: string; // auto-generated, read-only
  mainArtist: string;
  genre: string;
  tags: string;
  description: string;
  visibility: TrackVisibility;
  artwork: File | null;
  // Advanced details
  buyLink?: string;
  recordLabel?: string;
  releaseDate?: string;
  publisher?: string;
}

export interface IUploadTrackPayload {
  title: string;
  description?: string;
  genre?: string;
  tags?: string[];
  isPrivate?: boolean;
  artwork?: File;
}
 
export interface IUploadResponse {
  trackId: string;
  title: string;
  streamUrl: string;
  artworkUrl?: string;
  createdAt: string;
}
 
export interface IUploadService {
  getQuota(): Promise<IUploadQuota>;
  uploadTrack(
    file: File,
    payload: IUploadTrackPayload,
    onProgress: (progress: number) => void
  ): Promise<IUploadResponse>;
}