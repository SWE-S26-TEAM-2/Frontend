import { IAdvertisingSettings } from "@/types/settings-advertising.types";
import { MOCK_ADVERTISING_SETTINGS } from "./mockData";

export const getMockAdvertisingSettings = async (): Promise<IAdvertisingSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...MOCK_ADVERTISING_SETTINGS });
    }, 500);
  });
};

export const updateMockAdvertisingSettings = async (
  settings: Partial<IAdvertisingSettings>
): Promise<IAdvertisingSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(MOCK_ADVERTISING_SETTINGS, settings);
      resolve({ ...MOCK_ADVERTISING_SETTINGS });
    }, 500);
  });
};