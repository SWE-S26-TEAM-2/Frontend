import type { INotificationSettings } from "@/types/settings-notification.types";
import { unsupportedApiFeature } from "./apiMode";

export const getNotificationSettingsFromAPI = async (): Promise<INotificationSettings> => {
  unsupportedApiFeature("settings.notification.getSettings()");
};

export const updateNotificationSettingsOnAPI = async (
  settings: Partial<INotificationSettings>
): Promise<INotificationSettings> => {
  void settings;
  unsupportedApiFeature("settings.notification.updateSettings()");
};
