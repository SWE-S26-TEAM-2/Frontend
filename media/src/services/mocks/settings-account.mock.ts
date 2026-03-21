import { IAccountSettings } from "@/types/settings-account.types";
import { MOCK_ACCOUNT_SETTINGS } from "./mockData";

export const getMockAccountSettings = async (): Promise<IAccountSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...MOCK_ACCOUNT_SETTINGS });
    }, 500);
  });
};

export const updateMockAccountSettings = async (
  settings: Partial<IAccountSettings>
): Promise<IAccountSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(MOCK_ACCOUNT_SETTINGS, settings);
      resolve({ ...MOCK_ACCOUNT_SETTINGS });
    }, 500);
  });
};