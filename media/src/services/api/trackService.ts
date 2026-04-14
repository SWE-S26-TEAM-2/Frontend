import type { ITrack, ITrackListResponse, ITrackService } from "@/types/track.types";
import { ENV } from "@/config/env";
import { apiGet } from "./apiClient";
import { mockTrackService } from "../mocks/trackService";

// Backend Track → ITrack normalizer
function normalizeTrack(d: Record<string, unknown>): ITrack {
  return {
    id: (d.track_id ?? d.id) as string,
    title: d.title as string,
    artist: (d.artist ?? d.user_id ?? "") as string,
    albumArt: (d.artwork_url ?? d.albumArt ?? "") as string,
    genre: d.genre as string | undefined,
    url: (d.file_url ?? d.url ?? "") as string,
    duration: (d.duration ?? 0) as number,
    likes: (d.likes ?? 0) as number,
    plays: (d.plays ?? 0) as number,
    commentsCount: (d.comments_count ?? d.commentsCount ?? 0) as number,
    isLiked: (d.is_liked ?? d.isLiked ?? false) as boolean,
    createdAt: (d.created_at ?? d.createdAt ?? new Date().toISOString()) as string,
    updatedAt: (d.updated_at ?? d.updatedAt ?? new Date().toISOString()) as string,
  };
}

export const realTrackService: ITrackService = {
  // GET /tracks/{id} — implemented in backend
  async getById(id: string): Promise<ITrack> {
    const data = await apiGet<Record<string, unknown>>(`${ENV.API_BASE_URL}/tracks/${id}`);
    return normalizeTrack(data);
  },

  // GET /search/tracks?keyword= — implemented in backend
  async search(query: string): Promise<ITrack[]> {
    const data = await apiGet<{ tracks: Record<string, unknown>[] }>(
      `${ENV.API_BASE_URL}/search/tracks?keyword=${encodeURIComponent(query.trim())}`
    );
    return (data.tracks ?? []).map(normalizeTrack);
  },

  // Not implemented on backend — fall back to mock
  async getAll(): Promise<ITrack[]> {
    console.warn("[trackService] getAll() not implemented on backend — using mock data");
    return mockTrackService.getAll();
  },

  async getAllPaginated(page = 1, pageSize = 10): Promise<ITrackListResponse> {
    console.warn("[trackService] getAllPaginated() not implemented on backend — using mock data");
    return mockTrackService.getAllPaginated(page, pageSize);
  },

  async getByGenre(genre: string): Promise<ITrack[]> {
    console.warn("[trackService] getByGenre() not implemented on backend — using mock data");
    return mockTrackService.getByGenre(genre);
  },

  async getTrending(limit = 10): Promise<ITrack[]> {
    console.warn("[trackService] getTrending() not implemented on backend — using mock data");
    return mockTrackService.getTrending(limit);
  },

  async getRelated(trackId: string, limit = 5): Promise<ITrack[]> {
    console.warn("[trackService] getRelated() not implemented on backend — using mock data");
    return mockTrackService.getRelated(trackId, limit);
  },
};
