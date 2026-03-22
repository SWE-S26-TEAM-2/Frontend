// src/services/privacy.service.ts

import { IPrivacySettings } from "@/types/privacy.types";
import { ENV } from "@/config/env";
import { getMockPrivacySettings, updateMockPrivacySettings } from "./mocks/privacy.mock";
import { getPrivacySettingsFromAPI, updatePrivacySettingsOnAPI } from "./api/privacy.api";

export const getPrivacySettings = async (): Promise<IPrivacySettings> => {
  // Just check the boolean - true = mock, false = real API
  if (ENV.USE_MOCK_API) {
    return getMockPrivacySettings();
  } else {
    return getPrivacySettingsFromAPI();
  }
};

export const updatePrivacySettings = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  if (ENV.USE_MOCK_API) {
    return updateMockPrivacySettings(settings);
  } else {
    return updatePrivacySettingsOnAPI(settings);
  }
};