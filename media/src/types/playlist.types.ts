import { ITrack } from "./track.types";

export type IPlaylistType = "playlist" | "album";

export interface IPlaylistOwner {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface IPlaylistTrack {
  position: number;
  track: ITrack;
}

export interface IPlaylist {
  id: string;
  slug: string;
  title: string;
  type: IPlaylistType;
  owner: IPlaylistOwner;
  artworkUrl: string;
  description?: string;
  isPrivate: boolean;
  trackCount: number;
  totalDuration: number; // seconds
  tracks: IPlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface IPlaylistService {
  getPlaylist: (username: string, slug: string) => Promise<IPlaylist>;
  getUserPlaylists: (username: string) => Promise<IPlaylist[]>;
  search: (query: string) => Promise<IPlaylist[]>;
}
