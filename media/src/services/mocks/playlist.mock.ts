import { MOCK_PLAYLISTS } from "./mockData";
import type { IPlaylist, IPlaylistService, IPlaylistCreateInput, IPlaylistUpdateInput, IPlaylistTrack } from "@/types/playlist.types";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const mockPlaylistService: IPlaylistService = {
  async getById(id: string): Promise<IPlaylist | null> {
    await delay(300);
    return MOCK_PLAYLISTS.find((p) => p.id === id || p.slug === id) ?? null;
  },

  async getUserPlaylists(userId: string): Promise<IPlaylist[]> {
    await delay(250);
    return MOCK_PLAYLISTS.filter((p) => p.owner?.id === userId || p.owner?.username === userId || p.creator === userId);
  },

  async create(input: IPlaylistCreateInput, creatorName: string): Promise<IPlaylist> {
    await delay(400);
    const newPlaylist: IPlaylist = {
      id: `playlist-${Date.now()}`,
      slug: input.title.toLowerCase().replace(/\s+/g, "-"),
      title: input.title,
      description: input.description,
      coverArt: input.coverArt,
      isPublic: input.isPublic,
      creator: creatorName,
      owner: { id: creatorName, username: creatorName },
      genre: input.genre,
      mood: input.mood,
      tracks: input.tracks ?? [],
      trackCount: input.tracks?.length ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PLAYLISTS.push(newPlaylist);
    return newPlaylist;
  },

  async update(input: IPlaylistUpdateInput): Promise<IPlaylist> {
    await delay(300);
    const idx = MOCK_PLAYLISTS.findIndex((p) => p.id === input.id);
    if (idx === -1) throw new Error(`Playlist "${input.id}" not found`);
    const updated = { ...MOCK_PLAYLISTS[idx], ...input, updatedAt: new Date().toISOString() };
    MOCK_PLAYLISTS[idx] = updated;
    return updated;
  },

  async deletePlaylist(id: string): Promise<void> {
    await delay(200);
    const idx = MOCK_PLAYLISTS.findIndex((p) => p.id === id);
    if (idx !== -1) MOCK_PLAYLISTS.splice(idx, 1);
  },

  async addTrackToPlaylist(playlistId: string, track: IPlaylistTrack): Promise<IPlaylist> {
    await delay(200);
    const playlist = MOCK_PLAYLISTS.find((p) => p.id === playlistId);
    if (!playlist) throw new Error(`Playlist "${playlistId}" not found`);
    playlist.tracks = [...(playlist.tracks ?? []), track];
    return playlist;
  },

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<IPlaylist> {
    await delay(200);
    const playlist = MOCK_PLAYLISTS.find((p) => p.id === playlistId);
    if (!playlist) throw new Error(`Playlist "${playlistId}" not found`);
    playlist.tracks = (playlist.tracks ?? []).filter((t) => t.id !== trackId);
    return playlist;
  },

  async createPlaylist(name: string, description?: string): Promise<IPlaylist> {
    await delay(300);
    const newPlaylist: IPlaylist = {
      id: `playlist-${Date.now()}`,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      title: name,
      description: description ?? "",
      isPublic: false,
      creator: "",
      owner: { id: "", username: "" },
      tracks: [],
      trackCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PLAYLISTS.push(newPlaylist);
    return newPlaylist;
  },

  async uploadCover(_playlistId: string, _file: File): Promise<string> {
    await delay(500);
    return "https://picsum.photos/seed/cover/300/300";
  },

  async likePlaylist(_playlistId: string): Promise<void> {
    await delay(200);
  },

  async unlikePlaylist(_playlistId: string): Promise<void> {
    await delay(200);
  },

  async getLikedPlaylists(): Promise<IPlaylist[]> {
    await delay(100);
    return [];
  },
};
