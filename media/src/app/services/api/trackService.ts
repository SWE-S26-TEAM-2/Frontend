import { Track } from "@/lib/mockData";

export const trackService = {
  async getAll(): Promise<Track[]> {
    const res = await fetch("/api/tracks");
    if (!res.ok) throw new Error("Failed to fetch tracks");
    return res.json();
  },

  async getById(id: string): Promise<Track | null> {
    const res = await fetch(`/api/tracks/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  async getByGenre(genre: string): Promise<Track[]> {
    const res = await fetch(`/api/tracks?genre=${genre}`);
    if (!res.ok) throw new Error("Failed to fetch tracks");
    return res.json();
  },
};
