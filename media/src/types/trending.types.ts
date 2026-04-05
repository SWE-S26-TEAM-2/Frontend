export interface ITrack {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  duration?: number; // in seconds
  genre?: string;
}

export interface IDotsMenuItem {
  label: string;
  href: string;
  dividerBefore?: boolean;
}

export interface ISliderProps {
  title: string;
  subtitle: string;
  tracks: ITrack[];
}