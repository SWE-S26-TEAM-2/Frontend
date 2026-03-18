import { ITwoFactorSettings } from "@/types/settings-two-factor.types";
import { ENV } from "@/config/env";
import { getMockTwoFactorSettings, updateMockTwoFactorSettings } from "./mocks/settings-two-factor.mock";
import { getTwoFactorSettingsFromAPI, updateTwoFactorSettingsOnAPI } from "./api/settings-two-factor.api";

export const getTwoFactorSettings = async (): Promise<ITwoFactorSettings> => {
  if (ENV.USE_MOCK_API) {
    return getMockTwoFactorSettings();
  } else {
    return getTwoFactorSettingsFromAPI();
  }
};

export const updateTwoFactorSettings = async (
  settings: Partial<ITwoFactorSettings>
): Promise<ITwoFactorSettings> => {
  if (ENV.USE_MOCK_API) {
    return updateMockTwoFactorSettings(settings);
  } else {
    return updateTwoFactorSettingsOnAPI(settings);
  }
};