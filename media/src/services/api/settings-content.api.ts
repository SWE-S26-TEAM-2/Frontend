import type { IContentSettings } from "@/types/settings-content.types";
import { unsupportedApiFeature } from "./apiMode";

export const getContentSettingsFromAPI = async (): Promise<IContentSettings> => {
  unsupportedApiFeature("settings.content.getSettings()");
};

export const updateContentSettingsOnAPI = async (
  settings: Partial<IContentSettings>
): Promise<IContentSettings> => {
  void settings;
  unsupportedApiFeature("settings.content.updateSettings()");
};
