import type { IAdvertisingSettings } from "@/types/settings-advertising.types";
import { getMockAdvertisingSettings, updateMockAdvertisingSettings } from "../mocks/settings-advertising.mock";

export const getAdvertisingSettingsFromAPI = async (): Promise<IAdvertisingSettings> => {
  console.warn("[settings] Advertising settings not implemented on backend — using mock");
  return getMockAdvertisingSettings();
};

export const updateAdvertisingSettingsOnAPI = async (
  settings: Partial<IAdvertisingSettings>
): Promise<IAdvertisingSettings> => {
  console.warn("[settings] Advertising settings not implemented on backend — using mock");
  return updateMockAdvertisingSettings(settings);
};
