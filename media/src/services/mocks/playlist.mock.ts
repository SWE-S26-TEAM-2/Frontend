import { MOCK_PLAYLISTS } from "./mockData";
import type { IPlaylist, IPlaylistService } from "@/types/playlist.types";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

  getPlaylistById: async (playlistId: string): Promise<IPlaylist> => {
    await delay(300);
    const playlist = MOCK_PLAYLISTS.find((p) => p.id === playlistId || p.slug === playlistId);
    if (!playlist) throw new Error(`Playlist "${playlistId}" not found`);
    return playlist;
  },

  createPlaylist: async (name: string, description?: string): Promise<IPlaylist> => {
    await delay(400);
    const newPlaylist: IPlaylist = {
      id: `playlist-${Date.now()}`,
      playlistId: `playlist-${Date.now()}`,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      title: name,
      type: "playlist",
      owner: { id: "testuser", username: "testuser", avatarUrl: "" },
      artworkUrl: "",
      description,
      isPrivate: false,
      trackCount: 0,
      totalDuration: 0,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PLAYLISTS.push(newPlaylist);
    return newPlaylist;
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addTrackToPlaylist: async (_playlistId: string, _trackId: string): Promise<void> => {
    await delay(200);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeTrackFromPlaylist: async (_playlistId: string, _trackId: string): Promise<void> => {
    await delay(200);
  },
};
