import type { INotificationSettings } from "@/types/settings-notification.types";
import { ENV } from "@/config/env";
import { apiGet, apiPatch } from "./apiClient";

const DEFAULT_NOTIFICATIONS: INotificationSettings = {
  activities: [],
  soundcloudUpdates: [],
};

export const getNotificationSettingsFromAPI = async (): Promise<INotificationSettings> => {
  try {
    return await apiGet<INotificationSettings>(`${ENV.API_BASE_URL}/users/me/notifications`);
  } catch {
    return { ...DEFAULT_NOTIFICATIONS };
  }
};

export const updateNotificationSettingsOnAPI = async (
  settings: Partial<INotificationSettings>
): Promise<INotificationSettings> => {
  try {
    return await apiPatch<INotificationSettings>(
      `${ENV.API_BASE_URL}/users/me/notifications`,
      settings
    );
  } catch {
    return { ...DEFAULT_NOTIFICATIONS, ...settings };
  }
};
