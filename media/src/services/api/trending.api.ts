import { apiGet } from "./apiClient";
import type { ITrack } from "@/types/track.types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api$/, "");

interface IRawSearchTrack {
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

interface ISearchResponse {
  tracks: IRawSearchTrack[];
}

function adaptTrack(raw: IRawSearchTrack): ITrack {
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

// Fetch once and split into sections so we don't hammer the API 3 times
let cachedTracks: ITrack[] | null = null;

async function getPublicTracks(): Promise<ITrack[]> {
  if (cachedTracks) return cachedTracks;
  try {
    const res = await apiGet<ISearchResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/search/tracks?keyword=&limit=60`
    );
    const items = res?.tracks ?? [];
    cachedTracks = items
      .sort((a, b) => b.play_count - a.play_count)
      .map(adaptTrack);
    return cachedTracks;
  } catch {
    return [];
  }
}

export const getCuratedTracksAPI  = async (): Promise<ITrack[]> =>
  (await getPublicTracks()).slice(0, 7);

export const getEmergingTracksAPI = async (): Promise<ITrack[]> =>
  (await getPublicTracks()).slice(7, 13);

export const getPowerPlaylistsAPI = async (): Promise<ITrack[]> =>
  (await getPublicTracks()).slice(13, 20);