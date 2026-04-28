import type { ITrack, ITrackListResponse, ITrackService } from "@/types/track.types";
import { ENV } from "@/config/env";
import { apiGet } from "./apiClient";

// Backend Track → ITrack normalizer
function normalizeTrack(d: Record<string, unknown>): ITrack {
  return {
    id: (d.track_id ?? d.id) as string,
    title: d.title as string,
    artist: (d.artist ?? d.user_id ?? "") as string,
    albumArt: (d.artwork_url ?? d.cover_image_url ?? d.albumArt ?? "") as string,
    genre: d.genre as string | undefined,
    url: (d.file_url ?? d.stream_url ?? d.url ?? "") as string,
    duration: (d.duration_seconds ?? d.duration ?? 0) as number,
    likes: (d.likes ?? 0) as number,
    plays: (d.play_count ?? d.plays ?? 0) as number,
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

  // GET /tracks/ — returns paginated list
  async getAll(): Promise<ITrack[]> {
    try {
      const data = await apiGet<Record<string, unknown>[] | { items?: Record<string, unknown>[] }>(
        `${ENV.API_BASE_URL}/tracks/`
      );
      const items = Array.isArray(data) ? data : (data.items ?? []);
      return items.map(normalizeTrack);
    } catch {
      return [];
    }
  },

  async getAllPaginated(page = 1, pageSize = 10): Promise<ITrackListResponse> {
    try {
      const data = await apiGet<{
        items?: Record<string, unknown>[];
        total?: number;
        page?: number;
        page_size?: number;
        has_more?: boolean;
      }>(`${ENV.API_BASE_URL}/tracks/?page=${page}&page_size=${pageSize}`);
      const items = (data.items ?? []).map(normalizeTrack);
      return {
        items,
        total: data.total ?? items.length,
        page: data.page ?? page,
        pageSize: data.page_size ?? pageSize,
        hasMore: data.has_more ?? false,
      };
    } catch {
      return { items: [], total: 0, page, pageSize, hasMore: false };
    }
  },

  async getByGenre(genre: string): Promise<ITrack[]> {
    try {
      const data = await apiGet<Record<string, unknown>[]>(
        `${ENV.API_BASE_URL}/tracks/?genre=${encodeURIComponent(genre)}`
      );
      return Array.isArray(data) ? data.map(normalizeTrack) : [];
    } catch {
      return [];
    }
  },

  async search(query: string): Promise<ITrack[]> {
    try {
      const data = await apiGet<{ tracks?: Record<string, unknown>[] } | Record<string, unknown>[]>(
        `${ENV.API_BASE_URL}/search/tracks?keyword=${encodeURIComponent(query)}`
      );
      const items = Array.isArray(data) ? data : (data.tracks ?? []);
      return items.map(normalizeTrack);
    } catch {
      return [];
    }
  },

  async getTrending(limit = 10): Promise<ITrack[]> {
    try {
      const data = await apiGet<Record<string, unknown>[]>(
        `${ENV.API_BASE_URL}/tracks/?sort=trending&limit=${limit}`
      );
      return Array.isArray(data) ? data.map(normalizeTrack) : [];
    } catch {
      return [];
    }
  },

  async getRelated(trackId: string, limit = 5): Promise<ITrack[]> {
    try {
      const data = await apiGet<Record<string, unknown>[]>(
        `${ENV.API_BASE_URL}/tracks/${trackId}/related?limit=${limit}`
      );
      return Array.isArray(data) ? data.map(normalizeTrack) : [];
    } catch {
      return [];
    }
  },
};
