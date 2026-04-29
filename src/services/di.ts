/**
 * Dependency Injection Layer
 * Handles switching between mock and real services based on ENV.USE_MOCK_API
 *
 * UPDATED: added playlistService alongside AuthService and trackService.
 */

import { ENV } from "../config/env";
import { RealAuthService } from "./api/auth.api";
import { MockAuthService } from "./mocks/auth.mock";
import { realTrackService } from "./api/trackService";
import { mockTrackService } from "./mocks/trackService";
import { realPlaylistService } from "./api/playlist.api";
import { mockPlaylistService } from "./mocks/playlist.mock";

/**
 * Authentication Service
 * Automatically switches between mock and real based on USE_MOCK_API flag
 */
export const AuthService = ENV.USE_MOCK_API ? MockAuthService : RealAuthService;

/**
 * Track Service
 * Automatically switches between mock and real based on USE_MOCK_API flag
 */
export const trackService = ENV.USE_MOCK_API ? mockTrackService : realTrackService;

/**
 * Playlist Service
 * Automatically switches between mock and real based on USE_MOCK_API flag
 */
export const playlistService = ENV.USE_MOCK_API
  ? mockPlaylistService
  : realPlaylistService;

/**
 * Service Status — helpful debug info
 */
export const serviceStatus = {
  isMocked: ENV.USE_MOCK_API,
  apiBaseUrl: ENV.API_BASE_URL,
  mode: ENV.USE_MOCK_API ? "MOCK" : "REAL",
};

// Named exports for direct imports
export {
  RealAuthService,
  MockAuthService,
  realTrackService,
  mockTrackService,
  realPlaylistService,
  mockPlaylistService,
};
