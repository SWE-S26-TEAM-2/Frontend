import { INotificationSettings } from "@/types/settings-notification.types";

export const getNotificationSettingsFromAPI = async (): Promise<INotificationSettings> => {
  console.error("🔵 API call: getNotificationSettings");
  throw new Error("API not implemented yet");
};

export const updateNotificationSettingsOnAPI = async (
  settings: Partial<INotificationSettings>
): Promise<INotificationSettings> => {
  console.error("🔵 API call: updateNotificationSettings", settings);
  throw new Error("API not implemented yet");
};