/**
 * Dependency Injection Layer — REAL API ONLY
 *
 * All services are wired directly to real API implementations.
 * No mock switching. No ENV.USE_MOCK_API checks.
 *
 * The messaging service (IMessagingService) is exported separately
 * from @/services/messaging — imported by messaging hooks and pages.
 */

import { RealAuthService } from "./api/auth.api";
import { realTrackService } from "./api/trackService";
import { realUserProfileService } from "./api/userProfile.api";
import type { IUserProfileService } from "@/types/userProfile.types";
import type { IPrivacySettings } from "@/types/settings-privacy.types";

// settings/privacy
import { getPrivacySettingsFromAPI, updatePrivacySettingsOnAPI } from "./api/settings-privacy.api";

// settings/account
import { getAccountSettingsFromAPI, updateAccountSettingsOnAPI } from "./api/settings-account.api";

// settings/notification
import { getNotificationSettingsFromAPI, updateNotificationSettingsOnAPI } from "./api/settings-notification.api";

// settings/content
import { getContentSettingsFromAPI, updateContentSettingsOnAPI } from "./api/settings-content.api";

// settings/advertising
import { getAdvertisingSettingsFromAPI, updateAdvertisingSettingsOnAPI } from "./api/settings-advertising.api";

// settings/two-factor
import { getTwoFactorSettingsFromAPI, updateTwoFactorSettingsOnAPI } from "./api/settings-two-factor.api";

// upload
import { realUploadService } from "./api/upload.api";
import type { IUploadService } from "@/types/upload.types";

// store
import { realStoreService } from "./api/store.api";
import type { IStoreService } from "@/types/store.types";

// feed
import { realFeedService } from "./api/feed.api";
import type { IFeedService } from "@/types/feed.types";

// playlist
import { realPlaylistService } from "./api/playlist.api";
import type { IPlaylistService } from "@/types/playlist.types";

// comment
import { realCommentService } from "./api/comment.api";
import type { ICommentService } from "@/types/comment.types";

// message
import { realMessageService } from "./api/message.api";
import type { IMessageService } from "@/types/message.types";

// chart
import { realChartService } from "./api/chart.api";
import type { IChartService } from "@/types/chart.types";

// notification
import { realNotificationService } from "./api/notification.api";
import type { INotificationService } from "@/types/notification.types";

// admin
import { realAdminService } from "./api/admin.api";
import type { IAdminService } from "@/types/admin.types";

// ── Service exports ───────────────────────────────────────────────────────────

export const AuthService = RealAuthService;

export const trackService = realTrackService;

export const userProfileService: IUserProfileService = realUserProfileService;

export const uploadService: IUploadService = realUploadService;

export const storeService: IStoreService = realStoreService;

export const privacyService = {
  getSettings: getPrivacySettingsFromAPI,
  updateSettings: updatePrivacySettingsOnAPI,
};

// Keep direct function exports for existing page imports.
export const getPrivacySettings = async (): Promise<IPrivacySettings> =>
  getPrivacySettingsFromAPI();

export const updatePrivacySettings = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> =>
  updatePrivacySettingsOnAPI(settings);

export const accountService = {
  getSettings: getAccountSettingsFromAPI,
  updateSettings: updateAccountSettingsOnAPI,
};

export const notificationService = {
  getSettings: getNotificationSettingsFromAPI,
  updateSettings: updateNotificationSettingsOnAPI,
};

export const contentService = {
  getSettings: getContentSettingsFromAPI,
  updateSettings: updateContentSettingsOnAPI,
};

export const advertisingService = {
  getSettings: getAdvertisingSettingsFromAPI,
  updateSettings: updateAdvertisingSettingsOnAPI,
};

export const twoFactorService = {
  getSettings: getTwoFactorSettingsFromAPI,
  updateSettings: updateTwoFactorSettingsOnAPI,
};

export const feedService: IFeedService = realFeedService;

export const playlistService: IPlaylistService = realPlaylistService;

export const commentService: ICommentService = realCommentService;

export const messageService: IMessageService = realMessageService;

export const chartService: IChartService = realChartService;

export const activityNotificationService: INotificationService = realNotificationService;

export const adminService: IAdminService = realAdminService;

// Re-export real implementations for any direct consumers
export {
  RealAuthService,
  realTrackService,
  getPrivacySettingsFromAPI,
  updatePrivacySettingsOnAPI,
  realUserProfileService,
  realUploadService,
};
