import { Track, MOCK_TRACKS } from "@/lib/mockData";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const trackService = {
  async getAll(): Promise<Track[]> {
    await delay(300);
    return MOCK_TRACKS;
  },

  async getById(id: string): Promise<Track | null> {
    await delay(200);
    return MOCK_TRACKS.find((t) => t.id === id) ?? null;
  },

  async getByGenre(genre: string): Promise<Track[]> {
    await delay(200);
    return MOCK_TRACKS.filter((t) => t.genre === genre);
  },
};
