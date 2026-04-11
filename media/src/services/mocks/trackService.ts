import { ITrack, ITrackListResponse } from "@/types/track.types";
import { ITrackService } from "@/types/track.types";
import { MOCK_TRACKS } from "@/services/mocks/mockData";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock track service for development/testing
 * Returns properly typed responses matching the real API
 */
export const mockTrackService: ITrackService = {
  /**
   * Get all tracks with pagination
   */
  async getAll(): Promise<ITrack[]> {
    await delay(300);
    return MOCK_TRACKS;
  },

  /**
   * Get paginated tracks
   */
  async getAllPaginated(page: number = 1, pageSize: number = 10): Promise<ITrackListResponse> {
    await delay(300);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = MOCK_TRACKS.slice(start, end);

    return {
      items,
      total: MOCK_TRACKS.length,
      page,
      pageSize,
      hasMore: end < MOCK_TRACKS.length,
    };
  },

  /**
   * Get track by ID
   */
  async getById(id: string): Promise<ITrack> {
    await delay(200);
    const track = MOCK_TRACKS.find((t) => t.id === id);

    if (!track) {
      throw new Error("Track not found");
    }

    return track;
  },

  /**
   * Get tracks by genre
   */
  async getByGenre(genre: string): Promise<ITrack[]> {
    await delay(200);
    return MOCK_TRACKS.filter((t) => t.genre && t.genre.toLowerCase() === genre.toLowerCase()
);
  },

  /**
   * Search tracks by title or artist
   */
  async search(query: string): Promise<ITrack[]> {
    await delay(250);
    const lowerQuery = query.trim().toLowerCase();
    return MOCK_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.artist.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get trending tracks (sorted by likes)
   */
  async getTrending(limit: number = 10): Promise<ITrack[]> {
    await delay(300);
    return [...MOCK_TRACKS]
      .sort((a, b) => b.plays - a.plays) // sort by plays for trending
      .slice(0, limit);
  },

  async getRelated(trackId: string, limit: number = 5): Promise<ITrack[]> {
  await delay(200);

  const current = MOCK_TRACKS.find((t) => t.id === trackId);
  if (!current) return [];

  return MOCK_TRACKS
  .filter((t) => t.genre && current.genre && t.genre.toLowerCase() === current.genre.toLowerCase() && t.id !== trackId)
  .sort((a, b) => b.plays - a.plays)
  .slice(0, limit);}
}
