import { INotificationSettings } from "@/types/notification.types";
import { ENV } from "@/config/env";
import { getMockNotificationSettings, updateMockNotificationSettings } from "./mocks/settings-notification.mock";
import { getNotificationSettingsFromAPI, updateNotificationSettingsOnAPI } from "./api/settings-notification.api";

export const getNotificationSettings = async (): Promise<INotificationSettings> => {
  if (ENV.USE_MOCK_API) {
    return getMockNotificationSettings();
  } else {
    return getNotificationSettingsFromAPI();
  }
};

export const updateNotificationSettings = async (
  settings: Partial<INotificationSettings>
): Promise<INotificationSettings> => {
  if (ENV.USE_MOCK_API) {
    return updateMockNotificationSettings(settings);
  } else {
    return updateNotificationSettingsOnAPI(settings);
  }
};