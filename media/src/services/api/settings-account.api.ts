import type { IAccountSettings } from "@/types/settings-account.types";
import { getMockAccountSettings, updateMockAccountSettings } from "../mocks/settings-account.mock";

export const getAccountSettingsFromAPI = async (): Promise<IAccountSettings> => {
  console.warn("[settings] Account settings not implemented on backend — using mock");
  return getMockAccountSettings();
};

export const updateAccountSettingsOnAPI = async (
  settings: Partial<IAccountSettings>
): Promise<IAccountSettings> => {
  console.warn("[settings] Account settings not implemented on backend — using mock");
  return updateMockAccountSettings(settings);
};
