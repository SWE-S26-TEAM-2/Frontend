// src/services/api/library.api.ts
// Real API implementation — switches in automatically via di.ts when USE_MOCK_API=false

import { apiGet, apiDelete } from "@/services/api/apiClient";
import type {
  ILibraryService,
  ILibraryOverview,
  ILibraryTrack,
  ILibraryPlaylist,
  ILibraryAlbum,
  ILibraryStation,
  ILibraryFollowing,
} from "@/types/library.types";
import { ENV } from "@/config/env";

const BASE = ENV.API_BASE_URL;

/**
 * All /library/* endpoints are scoped to the authenticated user via the
 * Bearer token that apiClient injects automatically (same pattern as every
 * other real service). No explicit userId is needed in the URL.
 * Confirm with the backend team that this is the agreed contract.
 */
export const realLibraryService: ILibraryService = {
  getOverview:  () => apiGet<ILibraryOverview>(`${BASE}/library/overview`),
  getLikes:     () => apiGet<ILibraryTrack[]>(`${BASE}/library/likes`),
  getPlaylists: () => apiGet<ILibraryPlaylist[]>(`${BASE}/library/playlists`),
  getAlbums:    () => apiGet<ILibraryAlbum[]>(`${BASE}/library/albums`),
  getStations:  () => apiGet<ILibraryStation[]>(`${BASE}/library/stations`),
  getFollowing: () => apiGet<ILibraryFollowing[]>(`${BASE}/library/following`),

  // FIX: clearHistory was missing — calls DELETE so backend can wipe the user's history
  // TODO: confirm exact endpoint path with backend team
  clearHistory: () => apiDelete<void>(`${BASE}/library/history`),
};