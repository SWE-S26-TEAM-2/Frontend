import type { IAccountSettings } from "@/types/settings-account.types";
import { unsupportedApiFeature } from "./apiMode";

export const getAccountSettingsFromAPI = async (): Promise<IAccountSettings> => {
  unsupportedApiFeature("settings.account.getSettings()");
};

export const updateAccountSettingsOnAPI = async (
  settings: Partial<IAccountSettings>
): Promise<IAccountSettings> => {
  void settings;
  unsupportedApiFeature("settings.account.updateSettings()");
};
