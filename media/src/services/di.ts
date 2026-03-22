/**
 * Dependency Injection Layer
 * Handles switching between mock and real services based on ENV.USE_MOCK_API
 *
 * Phase 2: playlistService now exposes create() and update() methods.
 */

import { ENV } from "../config/env";
import { RealAuthService } from "./api/auth.api";
import { MockAuthService } from "./mocks/auth.mock";
import { realTrackService } from "./api/trackService";
import { mockTrackService } from "./mocks/trackService";
import { realPlaylistService } from "./api/playlist.api";
import { mockPlaylistService } from "./mocks/playlist.mock";
import { getPrivacySettings, updatePrivacySettings } from "./privacy.service";

/**
 * Authentication Service
 */
export const AuthService = ENV.USE_MOCK_API ? MockAuthService : RealAuthService;

/**
 * Track Service
 */
export const trackService = ENV.USE_MOCK_API ? mockTrackService : realTrackService;

/**
 * Playlist Service
 * Exposes: getById(), create(), update()
 * Switches automatically via USE_MOCK_API flag.
 */
export const playlistService = ENV.USE_MOCK_API
  ? mockPlaylistService
  : realPlaylistService;

/**
 * Service status — debug info
 */
/**
 * Privacy Service
 * Exposes: getPrivacySettings(), updatePrivacySettings()
 * Internal switching via USE_MOCK_API is handled inside privacy.service.ts
 */
export const privacyService = { getPrivacySettings, updatePrivacySettings };

export const serviceStatus = {
  isMocked: ENV.USE_MOCK_API,
  apiBaseUrl: ENV.API_BASE_URL,
  mode: ENV.USE_MOCK_API ? "MOCK" : "REAL",
};

export {
  RealAuthService,
  MockAuthService,
  realTrackService,
  mockTrackService,
  realPlaylistService,
  mockPlaylistService,
};
