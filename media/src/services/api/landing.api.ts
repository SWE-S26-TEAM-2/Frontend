import { LANDING_DATA, MOCK_TRACKS, SLIDE_DATA } from "../mocks/landing.mock";
import { ILandingData, ILandingTrack, ISlideData } from "@/types/landing.types";
import type { ITrack } from "@/types/track.types";

/**
 * Service to fetch Landing and SlideShow data.
 * Simulates a network request to prepare for a real backend.
 */
export const LandingApiService = {
  getLandingData: async (): Promise<ILandingData> => {
    // Simulate 500ms network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return LANDING_DATA;
  },

  getTrendingTracks: async (): Promise<ITrack[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const now = new Date().toISOString();
    return MOCK_TRACKS.map((track: ILandingTrack) => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.artist,
      albumArt: "/covers/song1.jpg",
      url: "/tracks/song1.mp3",
      duration: 0,
      likes: 0,
      plays: 0,
      createdAt: now,
      updatedAt: now,
    }));
  },

  getSliderContent: async (): Promise<ISlideData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return SLIDE_DATA;
  }
};