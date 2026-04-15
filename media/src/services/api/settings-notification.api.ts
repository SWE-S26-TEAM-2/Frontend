import type { INotificationSettings } from "@/types/settings-notification.types";
import { getMockNotificationSettings, updateMockNotificationSettings } from "../mocks/settings-notification.mock";

export const getNotificationSettingsFromAPI = async (): Promise<INotificationSettings> => {
  console.warn("[settings] Notification settings not implemented on backend — using mock");
  return getMockNotificationSettings();
};

export const updateNotificationSettingsOnAPI = async (
  settings: Partial<INotificationSettings>
): Promise<INotificationSettings> => {
  console.warn("[settings] Notification settings not implemented on backend — using mock");
  return updateMockNotificationSettings(settings);
};
