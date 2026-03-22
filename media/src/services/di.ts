/**
 * Dependency Injection Layer
 * Handles switching between mock and real services based on ENV.USE_MOCK_API
 */

import { ENV } from "@/config/env";
import { RealAuthService } from "./api/auth.api";
import { MockAuthService } from "./mocks/auth.mock";
import { realTrackService } from "./api/trackService";
import { mockTrackService } from "./mocks/trackService";
import { getMockPrivacySettings, updateMockPrivacySettings } from "./mocks/privacy.mock";
import { getPrivacySettingsFromAPI, updatePrivacySettingsOnAPI } from "./api/privacy.api";
import { mockUserProfileService } from "./mocks/userProfile.mock";
import { realUserProfileService } from "./api/userProfile.api";
import type { IPrivacySettings } from "@/types/privacy.types";

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
 * Privacy Service
 * Automatically switches between mock and real based on USE_MOCK_API flag
 */
export const privacyService = ENV.USE_MOCK_API
  ? {
      get: getMockPrivacySettings,
      update: updateMockPrivacySettings,
    }
  : {
      get: getPrivacySettingsFromAPI,
      update: updatePrivacySettingsOnAPI,
    };

// Keep named exports for existing consumers while using centralized DI.
export const getPrivacySettings = async (): Promise<IPrivacySettings> => {
  return privacyService.get();
};

export const updatePrivacySettings = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  return privacyService.update(settings);
};

/**
 * User Profile Service
 * Automatically switches between mock and real based on USE_MOCK_API flag
 */
export const userProfileService = ENV.USE_MOCK_API
  ? mockUserProfileService
  : realUserProfileService;

/**
 * Service Status
 * Helpful debug info
 */
export const serviceStatus = {
  isMocked: ENV.USE_MOCK_API,
  apiBaseUrl: ENV.API_BASE_URL,
  mode: ENV.USE_MOCK_API ? "MOCK" : "REAL",
};

// Export individual services for direct imports if needed
export {
  RealAuthService,
  MockAuthService,
  realTrackService,
  mockTrackService,
  getMockPrivacySettings,
  updateMockPrivacySettings,
  getPrivacySettingsFromAPI,
  updatePrivacySettingsOnAPI,
  mockUserProfileService,
  realUserProfileService,
};