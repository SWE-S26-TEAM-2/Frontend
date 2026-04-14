import type { IPrivacySettings } from "@/types/settings-privacy.types";
import { getMockPrivacySettings, updateMockPrivacySettings } from "../mocks/settings-privacy.mock";

export const getPrivacySettingsFromAPI = async (): Promise<IPrivacySettings> => {
  console.warn("[settings] Privacy settings not implemented on backend — using mock");
  return getMockPrivacySettings();
};

export const updatePrivacySettingsOnAPI = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  console.warn("[settings] Privacy settings not implemented on backend — using mock");
  return updateMockPrivacySettings(settings);
};
