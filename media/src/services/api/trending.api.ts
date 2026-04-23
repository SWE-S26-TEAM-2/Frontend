import { ITrack } from "../../types/trending.types";
import { MOCK_CURATED, MOCK_EMERGING, MOCK_POWER } from "../mocks/trending.mock";

// Simulating a network delay for a professional feel
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getCuratedTracks = async (): Promise<ITrack[]> => {
  await delay(300); 
  return MOCK_CURATED;
};

export const getEmergingTracks = async (): Promise<ITrack[]> => {
  await delay(300);
  return MOCK_EMERGING;
};

export const getPowerPlaylists = async (): Promise<ITrack[]> => {
  await delay(300);
  return MOCK_POWER;
};