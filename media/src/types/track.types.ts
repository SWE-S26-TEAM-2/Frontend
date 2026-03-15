export interface ITrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
  url: string;
  genre?: string;
  likes?: number;
}