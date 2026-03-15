import { ITrack } from "@/types/track.types";
import { MOCK_TRACKS } from "@/services/mocks/mockData";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const trackService = {
  async getAll(): Promise<ITrack[]> {
    await delay(300);
    return MOCK_TRACKS;
  },

  async getById(id: string): Promise<ITrack | null> {
    await delay(200);
    return MOCK_TRACKS.find((t) => t.id === id) ?? null;
  },

  async getByGenre(genre: string): Promise<ITrack[]> {
    await delay(200);
    return MOCK_TRACKS.filter((t) => t.genre === genre);
  },
};
