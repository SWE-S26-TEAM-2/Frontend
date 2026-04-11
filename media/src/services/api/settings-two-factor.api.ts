import { ITwoFactorSettings } from "@/types/settings-two-factor.types";

export const getTwoFactorSettingsFromAPI = async (): Promise<ITwoFactorSettings> => {
  console.error("🔵 API call: getTwoFactorSettings");
  throw new Error("API not implemented yet");
};

export const updateTwoFactorSettingsOnAPI = async (
  settings: Partial<ITwoFactorSettings>
): Promise<ITwoFactorSettings> => {
  console.error("🔵 API call: updateTwoFactorSettings", settings);
  throw new Error("API not implemented yet");
};