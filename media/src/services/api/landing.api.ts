import { apiGet } from "./apiClient";
import { LANDING_DATA, SLIDE_DATA } from "../mocks/landing.mock";
import { ILandingData, ISlideData } from "@/types/landing.types";
import type { ITrack } from "@/types/track.types";
import { ENV } from "@/config/env";

const BASE_URL = ENV.API_BASE_URL.replace(/\/$/, "");

interface IRawDiscoverTrack {
  track_id:         string;
  title:            string;
  description:      string | null;
  genre:            string | null;
  cover_image_url:  string | null;
  stream_url:       string | null;
  duration_seconds: number | null;
  play_count:       number;
  like_count:       number;
  comment_count:    number;
  is_liked:         boolean;
  created_at:       string;
  artist: {
    display_name:    string;
    profile_picture: string | null;
  };
}

function isWithinLastMonth(dateStr: string): boolean {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return new Date(dateStr) >= oneMonthAgo;
}

function adaptDiscoverTrack(raw: IRawDiscoverTrack): ITrack {
  return {
    id:            raw.track_id,
    title:         raw.title,
    artist:        raw.artist?.display_name ?? "Unknown Artist",
    albumArt:      raw.cover_image_url
                     ? raw.cover_image_url.startsWith("http")
                       ? raw.cover_image_url
                       : `${BASE_URL}${raw.cover_image_url}`
                     : "/cc.jpg",
    genre:         raw.genre ?? undefined,
    description:   raw.description ?? undefined,
    url:           raw.stream_url
                     ? raw.stream_url.startsWith("http")
                       ? raw.stream_url
                       : `${BASE_URL}${raw.stream_url}`
                     : "",
    duration:      raw.duration_seconds ?? 0,
    likes:         raw.like_count,
    plays:         raw.play_count,
    commentsCount: raw.comment_count,
    isLiked:       raw.is_liked,
    createdAt:     raw.created_at,
    updatedAt:     raw.created_at,
  };
}

export const LandingApiService = {
  getLandingData: async (): Promise<ILandingData> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return LANDING_DATA;
  },

getSliderContent: async (): Promise<ISlideData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return SLIDE_DATA;
},


getTrendingTracks: async (): Promise<ITrack[]> => {
  try {
    const data = await apiGet<{ tracks: IRawDiscoverTrack[] }>(
      `${process.env.NEXT_PUBLIC_API_URL}/search/tracks?keyword=&limit=50`
    );

    const items: IRawDiscoverTrack[] = data?.tracks ?? [];
    if (items.length === 0) throw new Error("No tracks returned");

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recent = items.filter((t) => new Date(t.created_at) >= oneMonthAgo);
    const pool = recent.length > 0 ? recent : items;

    return pool
      .sort((a, b) => b.play_count - a.play_count)
      .slice(0, 10)
      .map(adaptDiscoverTrack);

  } catch (e) {
    console.warn("getTrendingTracks failed, using mock:", e);
    const now = new Date().toISOString();
    return [
      { id: "1", title: "7AM ON BRIDLE PATH", artist: "Drake",        albumArt: "/covers/song1.jpg", url: "", duration: 0, likes: 0, plays: 0, createdAt: now, updatedAt: now },
      { id: "2", title: "MONTERO",            artist: "Lil Nas X",    albumArt: "/covers/song1.jpg", url: "", duration: 0, likes: 0, plays: 0, createdAt: now, updatedAt: now },
      { id: "3", title: "SICKO MODE",         artist: "Travis Scott", albumArt: "/covers/song1.jpg", url: "", duration: 0, likes: 0, plays: 0, createdAt: now, updatedAt: now },
    ];
  }
},
};