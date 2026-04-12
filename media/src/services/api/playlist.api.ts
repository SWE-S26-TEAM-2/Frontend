import { ENV } from "@/config/env";
import type { IPlaylist, IPlaylistService } from "@/types/playlist.types";

export const realPlaylistService: IPlaylistService = {
  getPlaylist: async (username: string, slug: string): Promise<IPlaylist> => {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${username}/playlists/${slug}`);
    if (!res.ok) throw new Error(`Playlist "${slug}" not found`);
    return res.json();
  },

  getUserPlaylists: async (username: string): Promise<IPlaylist[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/users/${username}/playlists`);
    if (!res.ok) throw new Error("Failed to fetch user playlists");
    return res.json();
  },

  search: async (query: string): Promise<IPlaylist[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/playlists/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Playlist search failed");
    return res.json();
  },
};
