import { ITwoFactorSettings } from "@/types/settings-two-factor.types";
import { MOCK_TWO_FACTOR_SETTINGS } from "./mockData";

export const getMockTwoFactorSettings = async (): Promise<ITwoFactorSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...MOCK_TWO_FACTOR_SETTINGS });
    }, 500);
  });
};

export const updateMockTwoFactorSettings = async (
  settings: Partial<ITwoFactorSettings>
): Promise<ITwoFactorSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(MOCK_TWO_FACTOR_SETTINGS, settings);
      resolve({ ...MOCK_TWO_FACTOR_SETTINGS });
    }, 500);
  });
};