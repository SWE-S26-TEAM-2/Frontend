/**
 * Dependency Injection Layer
 * Handles switching between mock and real services based on ENV.USE_MOCK_API
 */

import { ENV } from "@/config/env";
import { RealAuthService } from "./api/auth.api";
import { MockAuthService } from "./mocks/auth.mock";
import { realTrackService } from "./api/trackService";
import { mockTrackService } from "./mocks/trackService";
import { mockUserProfileService } from "./mocks/userProfile.mock";
import { realUserProfileService } from "./api/userProfile.api";
import type { IUserProfileService } from "@/types/userProfile.types";
import type { IPrivacySettings } from "@/types/settings-privacy.types";
//import { IPrivacySettings } from "@/types/privacy.types";


// trending
import {
  getCuratedTracks,
  getEmergingTracks,
  getPowerPlaylists,
} from "./mocks/trending.mock"; 

import {
  getCuratedTracksAPI,
  getEmergingTracksAPI,
  getPowerPlaylistsAPI,
} from "./api/trending.api";

// settings/privacy
import { getMockPrivacySettings, updateMockPrivacySettings } from "./mocks/settings-privacy.mock";
import { getPrivacySettingsFromAPI, updatePrivacySettingsOnAPI } from "./api/settings-privacy.api";

// settings/account
import { getMockAccountSettings, updateMockAccountSettings } from "./mocks/settings-account.mock";
import { getAccountSettingsFromAPI, updateAccountSettingsOnAPI } from "./api/settings-account.api";

// settings/notification
import { getMockNotificationSettings, updateMockNotificationSettings } from "./mocks/settings-notification.mock";
import { getNotificationSettingsFromAPI, updateNotificationSettingsOnAPI } from "./api/settings-notification.api";

// settings/content
import { getMockContentSettings, updateMockContentSettings } from "./mocks/settings-content.mock";
import { getContentSettingsFromAPI, updateContentSettingsOnAPI } from "./api/settings-content.api";

// settings/advertising
import { getMockAdvertisingSettings, updateMockAdvertisingSettings } from "./mocks/settings-advertising.mock";
import { getAdvertisingSettingsFromAPI, updateAdvertisingSettingsOnAPI } from "./api/settings-advertising.api";

// settings/two-factor
import { getMockTwoFactorSettings, updateMockTwoFactorSettings } from "./mocks/settings-two-factor.mock";
import { getTwoFactorSettingsFromAPI, updateTwoFactorSettingsOnAPI } from "./api/settings-two-factor.api";

// upload
import { mockUploadService } from "./mocks/upload.mock";
import { realUploadService } from "./api/upload.api";
import type { IUploadService } from "@/types/upload.types";



import { mockHomeService, realHomeService } from "./api/home.api";
import { IHomeService } from "@/types/home.types";

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
 * User Profile Service
 * Automatically switches between mock and real based on USE_MOCK_API flag
 */
export const userProfileService: IUserProfileService = ENV.USE_MOCK_API
  ? mockUserProfileService
  : realUserProfileService;

/**
 * Upload Service
 */
export const uploadService: IUploadService = ENV.USE_MOCK_API
  ? mockUploadService
  : realUploadService;

/**
 * Settings - Privacy Service
 */
export const privacyService = {
  getSettings: ENV.USE_MOCK_API ? getMockPrivacySettings : getPrivacySettingsFromAPI,
  updateSettings: ENV.USE_MOCK_API ? updateMockPrivacySettings : updatePrivacySettingsOnAPI,
};

// Keep direct function exports for existing page imports.
export const getPrivacySettings = async (): Promise<IPrivacySettings> => {
  return privacyService.getSettings();
};

export const updatePrivacySettings = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  return privacyService.updateSettings(settings);
};

/**
 * Settings - Account Service
 */
export const accountService = {
  getSettings: ENV.USE_MOCK_API ? getMockAccountSettings : getAccountSettingsFromAPI,
  updateSettings: ENV.USE_MOCK_API ? updateMockAccountSettings : updateAccountSettingsOnAPI,
};

/**
 * Settings - Notification Service
 */
export const notificationService = {
  getSettings: ENV.USE_MOCK_API ? getMockNotificationSettings : getNotificationSettingsFromAPI,
  updateSettings: ENV.USE_MOCK_API ? updateMockNotificationSettings : updateNotificationSettingsOnAPI,
};

/**
 * Settings - Content Service
 */
export const contentService = {
  getSettings: ENV.USE_MOCK_API ? getMockContentSettings : getContentSettingsFromAPI,
  updateSettings: ENV.USE_MOCK_API ? updateMockContentSettings : updateContentSettingsOnAPI,
};

/**
 * Settings - Advertising Service
 */
export const advertisingService = {
  getSettings: ENV.USE_MOCK_API ? getMockAdvertisingSettings : getAdvertisingSettingsFromAPI,
  updateSettings: ENV.USE_MOCK_API ? updateMockAdvertisingSettings : updateAdvertisingSettingsOnAPI,
};

/**
 * Settings - Two Factor Service
 */
export const twoFactorService = {
  getSettings: ENV.USE_MOCK_API ? getMockTwoFactorSettings : getTwoFactorSettingsFromAPI,
  updateSettings: ENV.USE_MOCK_API ? updateMockTwoFactorSettings : updateTwoFactorSettingsOnAPI,
};

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
  mockUploadService,
  realUploadService,
};




export const trendingService = {
  getCurated: ENV.USE_MOCK_API ? getCuratedTracks : getCuratedTracksAPI,
  getEmerging: ENV.USE_MOCK_API ? getEmergingTracks : getEmergingTracksAPI,
  getPower: ENV.USE_MOCK_API ? getPowerPlaylists : getPowerPlaylistsAPI,
};




export const homeService: IHomeService =
  ENV.USE_MOCK_API
    ? mockHomeService
    : realHomeService;