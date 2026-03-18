import { IContentSettings } from "@/types/settings-content.types";
import { ENV } from "@/config/env";
import { getMockContentSettings, updateMockContentSettings } from "./mocks/settings-content.mock";
import { getContentSettingsFromAPI, updateContentSettingsOnAPI } from "./api/settings-content.api";

export const getContentSettings = async (): Promise<IContentSettings> => {
  if (ENV.USE_MOCK_API) {
    return getMockContentSettings();
  } else {
    return getContentSettingsFromAPI();
  }
};

export const updateContentSettings = async (
  settings: Partial<IContentSettings>
): Promise<IContentSettings> => {
  if (ENV.USE_MOCK_API) {
    return updateMockContentSettings(settings);
  } else {
    return updateContentSettingsOnAPI(settings);
  }
};