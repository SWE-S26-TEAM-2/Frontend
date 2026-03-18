import { INotificationSettings } from "@/types/notification.types";
import { MOCK_NOTIFICATION_SETTINGS } from "./mockData";

export const getMockNotificationSettings = async (): Promise<INotificationSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        activities: [...MOCK_NOTIFICATION_SETTINGS.activities],
        soundcloudUpdates: [...MOCK_NOTIFICATION_SETTINGS.soundcloudUpdates],
      });
    }, 500);
  });
};

export const updateMockNotificationSettings = async (
  settings: Partial<INotificationSettings>
): Promise<INotificationSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(MOCK_NOTIFICATION_SETTINGS, settings);
      resolve({
        activities: [...MOCK_NOTIFICATION_SETTINGS.activities],
        soundcloudUpdates: [...MOCK_NOTIFICATION_SETTINGS.soundcloudUpdates],
      });
    }, 500);
  });
};