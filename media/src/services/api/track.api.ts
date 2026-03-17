// src/services/api/track.api.ts
import { ENV } from "../../config/env";
import { ITrack, ITrackListResponse } from "@/types/track.types";

/**
 * Real track API service
 * Makes actual HTTP requests to the backend
 */
export const realTrackService = {
  /**
   * Get all tracks (without pagination)
   */
  async getAll(): Promise<ITrack[]> {
    const response = await fetch(`${ENV.API_BASE_URL}/tracks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tracks");
    }

    const data = await response.json();
    return data.items || data;
  },

  /**
   * Get paginated tracks
   */
  async getAllPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ITrackListResponse> {
    const response = await fetch(
      `${ENV.API_BASE_URL}/tracks?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tracks");
    }

    return response.json();
  },

  /**
   * Get track by ID
   */
  async getById(id: string): Promise<ITrack | null> {
    const response = await fetch(`${ENV.API_BASE_URL}/tracks/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.track || data;
  },

  /**
   * Get tracks by genre
   */
  async getByGenre(genre: string): Promise<ITrack[]> {
    const response = await fetch(
      `${ENV.API_BASE_URL}/tracks?genre=${encodeURIComponent(genre)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tracks");
    }

    const data = await response.json();
    return data.items || data;
  },

  /**
   * Search tracks by title or artist
   */
  async search(query: string): Promise<ITrack[]> {
    const response = await fetch(
      `${ENV.API_BASE_URL}/tracks/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    return data.items || data;
  },

  /**
   * Get trending tracks (sorted by popularity)
   */
  async getTrending(limit: number = 10): Promise<ITrack[]> {
    const response = await fetch(
      `${ENV.API_BASE_URL}/tracks/trending?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch trending tracks");
    }

    const data = await response.json();
    return data.items || data;
  },

  /**
   * Like a track
   */
  async like(trackId: string, token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${ENV.API_BASE_URL}/tracks/${trackId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to like track");
    }

    return response.json();
  },

  /**
   * Unlike a track
   */
  async unlike(trackId: string, token: string): Promise<{ success: boolean }> {
    const response = await fetch(`${ENV.API_BASE_URL}/tracks/${trackId}/unlike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to unlike track");
    }

    return response.json();
  },
};
