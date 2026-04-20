import type { IAdvertisingSettings } from "@/types/settings-advertising.types";
import { unsupportedApiFeature } from "./apiMode";

export const getAdvertisingSettingsFromAPI = async (): Promise<IAdvertisingSettings> => {
  unsupportedApiFeature("settings.advertising.getSettings()");
};

export const updateAdvertisingSettingsOnAPI = async (
  settings: Partial<IAdvertisingSettings>
): Promise<IAdvertisingSettings> => {
  void settings;
  unsupportedApiFeature("settings.advertising.updateSettings()");
};
