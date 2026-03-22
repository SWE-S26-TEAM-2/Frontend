import { LANDING_DATA, MOCK_TRACKS, SLIDE_DATA } from "../mocks/landing.mock";
import { ILandingData, ITrack, ISlideData } from "@/types/landing.types";

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
    return MOCK_TRACKS;
  },

  getSliderContent: async (): Promise<ISlideData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return SLIDE_DATA;
  }
};