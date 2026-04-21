import { ITrack } from "@/types/track.types";
import { ENV } from "@/config/env";

export const getCuratedTracksAPI = async (): Promise<ITrack[]> => {
  const res = await fetch(`${ENV.API_BASE_URL}/tracks/curated`);
  if (!res.ok) throw new Error("Failed curated tracks");
  return res.json();
};

export const getEmergingTracksAPI = async (): Promise<ITrack[]> => {
  const res = await fetch(`${ENV.API_BASE_URL}/tracks/emerging`);
  if (!res.ok) throw new Error("Failed emerging tracks");
  return res.json();
};

export const getPowerPlaylistsAPI = async (): Promise<ITrack[]> => {
  const res = await fetch(`${ENV.API_BASE_URL}/tracks/power`);
  if (!res.ok) throw new Error("Failed power playlists");
  return res.json();
};