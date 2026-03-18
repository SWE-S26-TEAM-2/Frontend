import { IAccountSettings } from "@/types/settings-account.types";
import { ENV } from "@/config/env";
import { getMockAccountSettings, updateMockAccountSettings } from "./mocks/settings-account.mock";
import { getAccountSettingsFromAPI, updateAccountSettingsOnAPI } from "./api/settings-account.api";

export const getAccountSettings = async (): Promise<IAccountSettings> => {
  if (ENV.USE_MOCK_API) {
    return getMockAccountSettings();
  } else {
    return getAccountSettingsFromAPI();
  }
};

export const updateAccountSettings = async (
  settings: Partial<IAccountSettings>
): Promise<IAccountSettings> => {
  if (ENV.USE_MOCK_API) {
    return updateMockAccountSettings(settings);
  } else {
    return updateAccountSettingsOnAPI(settings);
  }
};