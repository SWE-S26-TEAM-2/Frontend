import type { ITrack, ITrackListResponse, ITrackService } from "@/types/track.types";
import { ENV } from "@/config/env";
import { apiGet } from "./apiClient";
import { unsupportedApiFeature } from "./apiMode";

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
  async getById(id: string): Promise<ITrack> {
    const data = await apiGet<Record<string, unknown>>(`${ENV.API_BASE_URL}/tracks/${id}`);
    return normalizeTrack(data);
  },

  async search(query: string): Promise<ITrack[]> {
    const data = await apiGet<{ tracks: Record<string, unknown>[] }>(
      `${ENV.API_BASE_URL}/search/tracks?keyword=${encodeURIComponent(query.trim())}`
    );
    return (data.tracks ?? []).map(normalizeTrack);
  },

  async getAll(): Promise<ITrack[]> {
    unsupportedApiFeature("trackService.getAll()");
  },

  async getAllPaginated(page = 1, pageSize = 10): Promise<ITrackListResponse> {
    void page;
    void pageSize;
    unsupportedApiFeature("trackService.getAllPaginated()");
  },

  async getByGenre(genre: string): Promise<ITrack[]> {
    void genre;
    unsupportedApiFeature("trackService.getByGenre()");
  },

  async getTrending(limit = 10): Promise<ITrack[]> {
    void limit;
    unsupportedApiFeature("trackService.getTrending()");
  },

  async getRelated(trackId: string, limit = 5): Promise<ITrack[]> {
    void trackId;
    void limit;
    unsupportedApiFeature("trackService.getRelated()");
  },
};
