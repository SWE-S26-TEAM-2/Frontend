"use client";

// 1. Import the "Big" ITrack from your master types file
// Adjust the path (../../types/track.types) to where your first file lives
import { ITrack } from "@/types/track.types"; 

export interface IDotsMenuItem {
  label: string;
  href: string;
  dividerBefore?: boolean;
}

export interface ISliderProps {
  title: string;
  subtitle: string;
  // 2. Now this uses the official ITrack with url, albumArt, etc.
  tracks: ITrack[]; 
}