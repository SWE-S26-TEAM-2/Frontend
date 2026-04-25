/**
 * Playlist feature — TypeScript types
 *
 * Conventions:
 *  - Interfaces prefixed with I  (ESLint @typescript-eslint/naming-convention)
 *  - `albumArt` mirrors ITrack.albumArt in track.types.ts
 *  - `coverArt`  is the playlist-level artwork URL
 */

export interface IPlaylistTrack {
  id: string;
  title: string;
  artist: string;
  /** Artwork URL — intentionally matches ITrack.albumArt field name */
  albumArt: string;
  duration: number; // seconds
}

export interface IPlaylist {
  id: string;
  title: string;
  description: string;
  /** Playlist cover artwork URL */
  coverArt: string;
  /** Display name of the playlist creator */
  creator: string;
  tracks: IPlaylistTrack[];
}

/** State shape managed by usePlaylist hook */
export interface IPlaylistState {
  playlist: IPlaylist | null;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  retryCount: number;
}
