import type { IPrivacySettings } from "@/types/settings-privacy.types";
import { unsupportedApiFeature } from "./apiMode";

export const getPrivacySettingsFromAPI = async (): Promise<IPrivacySettings> => {
  unsupportedApiFeature("settings.privacy.getSettings()");
};

export const updatePrivacySettingsOnAPI = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  void settings;
  unsupportedApiFeature("settings.privacy.updateSettings()");
};
