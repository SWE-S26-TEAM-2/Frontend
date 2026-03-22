import { INotificationSettings } from "@/types/notification.types";

export const getNotificationSettingsFromAPI = async (): Promise<INotificationSettings> => {
  console.log("🔵 API call: getNotificationSettings");
  throw new Error("API not implemented yet");
};

export const updateNotificationSettingsOnAPI = async (
  settings: Partial<INotificationSettings>
): Promise<INotificationSettings> => {
  console.log("🔵 API call: updateNotificationSettings", settings);
  throw new Error("API not implemented yet");
};