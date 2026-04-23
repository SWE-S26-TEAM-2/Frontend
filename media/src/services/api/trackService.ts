import type { ITrack, ITrackListResponse, ITrackService } from "@/types/track.types";
import { ENV } from "@/config/env";
import { apiGet } from "./apiClient";
import { unsupportedApiFeature } from "./apiMode";

const RELATED_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "feat",
  "featuring",
  "ft",
  "in",
  "of",
  "official",
  "on",
  "remix",
  "the",
  "video",
  "with",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function resolveApiUrl(value: string | undefined): string {
  if (!value) return "";

  try {
    return new URL(value, `${ENV.API_BASE_URL}/`).toString();
  } catch {
    return value;
  }
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function buildTrackUrl(trackId: string, raw: Record<string, unknown>): string {
  const directUrl = asString(raw.file_url) ?? asString(raw.stream_url) ?? asString(raw.url);
  if (directUrl) {
    return resolveApiUrl(directUrl);
  }

  return trackId ? `${ENV.API_BASE_URL}/tracks/${trackId}/audio` : "";
}

async function searchTracks(query: string): Promise<ITrack[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const data = await apiGet<{ tracks?: unknown }>(
    `${ENV.API_BASE_URL}/search/tracks?keyword=${encodeURIComponent(trimmed)}`
  );

  const tracks = Array.isArray(data.tracks) ? data.tracks : [];
  return tracks.filter(isRecord).map(normalizeTrack);
}

function buildRelatedSearchTerms(track: ITrack): string[] {
  const normalizedTitle = track.title
    .replace(/[()[\]{}]/g, " ")
    .split(/[^a-zA-Z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  const significantTitleTokens = normalizedTitle.filter(
    (token) => token.length >= 4 && !RELATED_STOP_WORDS.has(token.toLowerCase())
  );

  const orderedCandidates = [
    track.genre,
    track.artist && !isUuidLike(track.artist) ? track.artist : undefined,
    significantTitleTokens.slice(0, 2).join(" "),
    ...significantTitleTokens.slice(0, 4),
    normalizedTitle[0],
  ];

  return orderedCandidates.filter((value, index, values): value is string => {
    if (!value) return false;

    const normalizedValue = value.trim().toLowerCase();
    return values.findIndex((candidate) => candidate?.trim().toLowerCase() === normalizedValue) === index;
  });
}

function normalizeTrack(d: Record<string, unknown>): ITrack {
  const id = (d.track_id ?? d.id ?? "") as string;

  return {
    id,
    title: d.title as string,
    artist: (d.artist ?? d.user_id ?? "") as string,
    albumArt: resolveApiUrl(
      asString(d.artwork_url) ?? asString(d.cover_image_url) ?? asString(d.albumArt)
    ),
    genre: d.genre as string | undefined,
    description: asString(d.description),
    url: buildTrackUrl(id, d),
    duration: asNumber(d.duration) ?? asNumber(d.duration_seconds) ?? 0,
    likes: (d.likes ?? 0) as number,
    plays: asNumber(d.plays) ?? asNumber(d.play_count) ?? 0,
    commentsCount: (d.comments_count ?? d.commentsCount ?? 0) as number,
    isLiked: (d.is_liked ?? d.isLiked ?? false) as boolean,
    createdAt: (d.created_at ?? d.createdAt ?? d.release_date ?? new Date().toISOString()) as string,
    updatedAt: (d.updated_at ?? d.updatedAt ?? d.release_date ?? new Date().toISOString()) as string,
  };
}

export const realTrackService: ITrackService = {
  async getById(id: string): Promise<ITrack> {
    const data = await apiGet<Record<string, unknown>>(`${ENV.API_BASE_URL}/tracks/${id}`);
    return normalizeTrack(data);
  },

  async search(query: string): Promise<ITrack[]> {
    return searchTracks(query);
  },

  async getAll(): Promise<ITrack[]> {
    unsupportedApiFeature("trackService.getAll()");
  },

  async getAllPaginated(page = 1, pageSize = 10): Promise<ITrackListResponse> {
    void page;
    void pageSize;
    unsupportedApiFeature("trackService.getAllPaginated()");
  },

  async getByGenre(genre: string): Promise<ITrack[]> {
    void genre;
    unsupportedApiFeature("trackService.getByGenre()");
  },

  async getTrending(limit = 10): Promise<ITrack[]> {
    void limit;
    unsupportedApiFeature("trackService.getTrending()");
  },

  async getRelated(trackId: string, limit = 5): Promise<ITrack[]> {
    const sourceTrack = await this.getById(trackId);
    const candidates: ITrack[] = [];
    const seenTrackIds = new Set([trackId]);

    for (const term of buildRelatedSearchTerms(sourceTrack)) {
      if (candidates.length >= limit) break;

      const results = await searchTracks(term);
      for (const result of results) {
        if (seenTrackIds.has(result.id)) continue;

        seenTrackIds.add(result.id);
        candidates.push(result);

        if (candidates.length >= limit) break;
      }
    }

    return candidates.slice(0, limit);
  },
};
