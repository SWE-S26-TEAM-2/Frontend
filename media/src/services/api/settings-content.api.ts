import type { IContentSettings } from "@/types/settings-content.types";
import { getMockContentSettings, updateMockContentSettings } from "../mocks/settings-content.mock";

export const getContentSettingsFromAPI = async (): Promise<IContentSettings> => {
  console.warn("[settings] Content settings not implemented on backend — using mock");
  return getMockContentSettings();
};

export const updateContentSettingsOnAPI = async (
  settings: Partial<IContentSettings>
): Promise<IContentSettings> => {
  console.warn("[settings] Content settings not implemented on backend — using mock");
  return updateMockContentSettings(settings);
};
