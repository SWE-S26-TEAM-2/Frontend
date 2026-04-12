import { MOCK_PLAYLISTS } from "./mockData";
import type { IPlaylist, IPlaylistService } from "@/types/playlist.types";

export const mockPlaylistService: IPlaylistService = {
  getPlaylist: async (username: string, slug: string): Promise<IPlaylist> => {
    await new Promise((r) => setTimeout(r, 300));
    const playlist = MOCK_PLAYLISTS.find(
      (p) => p.owner.username === username && p.slug === slug
    );
    if (!playlist) throw new Error(`Playlist "${slug}" not found for user "${username}"`);
    return playlist;
  },

  getUserPlaylists: async (username: string): Promise<IPlaylist[]> => {
    await new Promise((r) => setTimeout(r, 250));
    return MOCK_PLAYLISTS.filter((p) => p.owner.username === username);
  },

  search: async (query: string): Promise<IPlaylist[]> => {
    await new Promise((r) => setTimeout(r, 300));
    const q = query.toLowerCase();
    return MOCK_PLAYLISTS.filter(
      (p) => p.title.toLowerCase().includes(q) || p.owner.username.toLowerCase().includes(q)
    );
  },
};
