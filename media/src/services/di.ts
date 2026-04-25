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

// settings/privacy
import { getMockPrivacySettings, updateMockPrivacySettings } from "./mocks/settings-privacy.mock";
import { getPrivacySettingsFromAPI, updatePrivacySettingsOnAPI } from "./api/settings-privacy.api";

// settings/account
import { getMockAccountSettings, updateMockAccountSettings } from "./mocks/settings-account.mock";
import { getAccountSettingsFromAPI, updateAccountSettingsOnAPI } from "./api/settings-account.api";
import { sendMockPasswordResetEmail } from "./mocks/settings-account.mock";
import { sendPasswordResetEmailFromAPI } from "./api/settings-account.api";

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

// studio
import { mockStudioService } from "./mocks/studio.mock";
import { realStudioService } from "./api/studio.api";
import type { IStudioService } from "@/types/studio.types";
// store
import { mockStoreService } from "./mocks/store.mock";
import { realStoreService } from "./api/store.api";
import type { IStoreService } from "@/types/store.types";

// feed
import { mockFeedService } from "./mocks/feed.mock";
import { realFeedService } from "./api/feed.api";
import type { IFeedService } from "@/types/feed.types";

// playlist
import { mockPlaylistService } from "./mocks/playlist.mock";
import { realPlaylistService } from "./api/playlist.api";
import type { IPlaylistService } from "@/types/playlist.types";

// comment
import { mockCommentService } from "./mocks/comment.mock";
import { realCommentService } from "./api/comment.api";
import type { ICommentService } from "@/types/comment.types";

// message
import { mockMessageService } from "./mocks/message.mock";
import { realMessageService } from "./api/message.api";
import type { IMessageService } from "@/types/message.types";

// chart
import { mockChartService } from "./mocks/chart.mock";
import { realChartService } from "./api/chart.api";
import type { IChartService } from "@/types/chart.types";

// notification (new — page-level; distinct from settings notificationService)
import { mockNotificationService } from "./mocks/notification.mock";
import { realNotificationService } from "./api/notification.api";
import type { INotificationService } from "@/types/notification.types";

// admin
import { mockAdminService } from "./mocks/admin.mock";
import { realAdminService } from "./api/admin.api";
import type { IAdminService } from "@/types/admin.types";

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
 * Studio Service
 */
/**
 * Studio Service
 * Hardcoded to mock — backend has no track-listing or bulk-edit endpoints yet.
 */
export const studioService: IStudioService = mockStudioService;

/**
 * Store Service
 */
export const storeService: IStoreService = ENV.USE_MOCK_API
  ? mockStoreService
  : realStoreService;

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
  sendPasswordResetEmail: ENV.USE_MOCK_API ? sendMockPasswordResetEmail : sendPasswordResetEmailFromAPI,
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
 * Feed Service
 */
export const feedService: IFeedService = ENV.USE_MOCK_API
  ? mockFeedService
  : realFeedService;

/**
 * Playlist Service
 */
export const playlistService: IPlaylistService = ENV.USE_MOCK_API
  ? mockPlaylistService
  : realPlaylistService;

/**
 * Comment Service
 */
export const commentService: ICommentService = ENV.USE_MOCK_API
  ? mockCommentService
  : realCommentService;

/**
 * Message Service
 */
export const messageService: IMessageService = ENV.USE_MOCK_API
  ? mockMessageService
  : realMessageService;

/**
 * Chart Service
 */
export const chartService: IChartService = ENV.USE_MOCK_API
  ? mockChartService
  : realChartService;

/**
 * Activity Notification Service (page-level — distinct from settings notificationService)
 */
export const activityNotificationService: INotificationService = ENV.USE_MOCK_API
  ? mockNotificationService
  : realNotificationService;

/**
 * Admin Service
 */
export const adminService: IAdminService = ENV.USE_MOCK_API
  ? mockAdminService
  : realAdminService;

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
  mockStudioService,
  realStudioService,
};