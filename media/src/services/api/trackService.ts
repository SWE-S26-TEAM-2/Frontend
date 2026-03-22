import { ITrack, ITrackListResponse } from "@/types/track.types";
import { ITrackService } from "@/types/track.types";
import { ENV } from "@/config/env";

export const realTrackService: ITrackService = {
  async getAll(): Promise<ITrack[]> {
    const res = await fetch(`${ENV.API_BASE_URL}/tracks`);

    if (!res.ok) throw new Error("Failed to fetch tracks");

    const data = await res.json();
    return data.items ?? data;
  },

  async getAllPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ITrackListResponse> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/tracks?page=${page}&pageSize=${pageSize}`
    );

    if (!res.ok) throw new Error("Failed to fetch tracks");

    return res.json();
  },

  async getById(id: string): Promise<ITrack> {
    const res = await fetch(`${ENV.API_BASE_URL}/tracks/${id}`);

    if (!res.ok) {
      throw new Error("Track not found"); // ✅ match mock behavior
    }

    const data = await res.json();

    return data.track ?? data; // normalize
  },

  async getByGenre(genre: string): Promise<ITrack[]> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/tracks?genre=${encodeURIComponent(genre)}`
    );

    if (!res.ok) throw new Error("Failed to fetch tracks");

    const data = await res.json();
    return data.items ?? data;
  },

  async search(query: string): Promise<ITrack[]> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/tracks/search?q=${encodeURIComponent(query.trim())}`
    );

    if (!res.ok) throw new Error("Search failed");

    const data = await res.json();
    return data.items ?? data;
  },

  async getTrending(limit: number = 10): Promise<ITrack[]> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/tracks/trending?limit=${limit}`
    );

    if (!res.ok) throw new Error("Failed to fetch trending");

    const data = await res.json();
    return data.items ?? data;
  },

  async getRelated(trackId: string, limit: number = 5): Promise<ITrack[]> {
    const res = await fetch(
      `${ENV.API_BASE_URL}/tracks/${trackId}/related?limit=${limit}`
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.items ?? data;
  },
};