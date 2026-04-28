import type { IAccountSettings } from "@/types/settings-account.types";
import { ENV } from "@/config/env";
import { apiGet, apiPatch } from "./apiClient";

const DEFAULT_ACCOUNT: IAccountSettings = {
  theme: "dark",
  emails: [],
  linkedAccounts: { facebook: false, google: false, apple: false },
};

export const getAccountSettingsFromAPI = async (): Promise<IAccountSettings> => {
  try {
    return await apiGet<IAccountSettings>(`${ENV.API_BASE_URL}/users/me/account`);
  } catch {
    return { ...DEFAULT_ACCOUNT };
  }
};

export const updateAccountSettingsOnAPI = async (
  settings: Partial<IAccountSettings>
): Promise<IAccountSettings> => {
  try {
    return await apiPatch<IAccountSettings>(`${ENV.API_BASE_URL}/users/me/account`, settings);
  } catch {
    return { ...DEFAULT_ACCOUNT, ...settings };
  }
};
