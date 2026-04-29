import { ITrack } from "./track.types";

export type IChartPeriod = "top50" | "new-hot";

export type IChartGenre =
  | "all-music"
  | "alternative-rock"
  | "ambient"
  | "classical"
  | "country"
  | "dancehall"
  | "deep-house"
  | "disco-funk"
  | "drum-bass"
  | "electronic"
  | "hip-hop-rap"
  | "house"
  | "indie"
  | "jazz-blues"
  | "latin"
  | "metal"
  | "piano"
  | "pop"
  | "r-b-soul"
  | "reggae"
  | "reggaeton"
  | "rock"
  | "soundtrack"
  | "techno"
  | "trance"
  | "trap"
  | "world";

export type IChartRankChange = "up" | "down" | "new" | "same";

export interface IChartTrack {
  rank: number;
  rankDelta: number;       // positive = moved up, negative = moved down, 0 = new/same
  rankChange: IChartRankChange;
  track: ITrack;
}

export interface IChart {
  genre: IChartGenre;
  period: IChartPeriod;
  updatedAt: string;
  entries: IChartTrack[];
}

export interface IChartService {
  getChart: (genre: IChartGenre, period: IChartPeriod) => Promise<IChart>;
}
