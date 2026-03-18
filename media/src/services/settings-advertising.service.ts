import { IAdvertisingSettings } from "@/types/settings-advertising.types";
import { ENV } from "@/config/env";
import { getMockAdvertisingSettings, updateMockAdvertisingSettings } from "./mocks/settings-advertising.mock";
import { getAdvertisingSettingsFromAPI, updateAdvertisingSettingsOnAPI } from "./api/settings-advertising.api";

export const getAdvertisingSettings = async (): Promise<IAdvertisingSettings> => {
  if (ENV.USE_MOCK_API) {
    return getMockAdvertisingSettings();
  } else {
    return getAdvertisingSettingsFromAPI();
  }
};

export const updateAdvertisingSettings = async (
  settings: Partial<IAdvertisingSettings>
): Promise<IAdvertisingSettings> => {
  if (ENV.USE_MOCK_API) {
    return updateMockAdvertisingSettings(settings);
  } else {
    return updateAdvertisingSettingsOnAPI(settings);
  }
};