import type { ITrack } from "@/types/track.types";

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

export interface IExtendedSliderProps {
  title: string;
  subtitle: string;
  tracks: ITrack[];
  showFollow?: boolean;
}