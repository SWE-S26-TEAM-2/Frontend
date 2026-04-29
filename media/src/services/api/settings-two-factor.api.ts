import type { ITwoFactorSettings } from "@/types/settings-two-factor.types";
import { unsupportedApiFeature } from "./apiMode";

export const getTwoFactorSettingsFromAPI = async (): Promise<ITwoFactorSettings> => {
  unsupportedApiFeature("settings.twoFactor.getSettings()");
};

export const updateTwoFactorSettingsOnAPI = async (
  settings: Partial<ITwoFactorSettings>
): Promise<ITwoFactorSettings> => {
  void settings;
  unsupportedApiFeature("settings.twoFactor.updateSettings()");
};
