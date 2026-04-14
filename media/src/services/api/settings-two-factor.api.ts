import type { ITwoFactorSettings } from "@/types/settings-two-factor.types";
import { getMockTwoFactorSettings, updateMockTwoFactorSettings } from "../mocks/settings-two-factor.mock";

export const getTwoFactorSettingsFromAPI = async (): Promise<ITwoFactorSettings> => {
  console.warn("[settings] Two-factor settings not implemented on backend — using mock");
  return getMockTwoFactorSettings();
};

export const updateTwoFactorSettingsOnAPI = async (
  settings: Partial<ITwoFactorSettings>
): Promise<ITwoFactorSettings> => {
  console.warn("[settings] Two-factor settings not implemented on backend — using mock");
  return updateMockTwoFactorSettings(settings);
};
