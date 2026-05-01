/**
 * Station types
 * Place at: types/station.types.ts
 */


import type { ITrack } from "@/types/track.types";

// ── STATION ───────────────────────────────────────────────────────────────────

export interface IStation {
  id: string;
  name: string;           // e.g. "Based on Midnight Echoes"
  artistName: string;     // e.g. "Luna Waves"
  coverArt: string;       // album art of the seed track
  seedTrack: ITrack;      // the track this station is based on
  isLiked: boolean;
  genre?: string;
}


export  interface IStationSliderProps {
  title:    string;
  subtitle: string;
  stations: IStation[];
}


// ── PAGE DATA ─────────────────────────────────────────────────────────────────

export interface IStationsPageData {
  likedStations: IStation[];
}

// ── HOME SLIDER DATA ──────────────────────────────────────────────────────────

export interface IDiscoverStationsData {
  stations: IStation[];   // genre-based, from listening history
}

// ── SERVICE INTERFACE ─────────────────────────────────────────────────────────

export interface IStationService {
  getLikedStations(): Promise<IStation[]>;
  getDiscoverStations(): Promise<IStation[]>;  // for home page slider
  toggleLike(stationId: string): Promise<void>;
}