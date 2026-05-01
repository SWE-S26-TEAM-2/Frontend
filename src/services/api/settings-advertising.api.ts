import type { IAdvertisingSettings } from "@/types/settings-advertising.types";
import { ENV } from "@/config/env";
import { apiGet, apiPatch } from "./apiClient";

const DEFAULT_ADVERTISING: IAdvertisingSettings = {
  partnersListUrl: "",
  language: "en",
};

export const getAdvertisingSettingsFromAPI = async (): Promise<IAdvertisingSettings> => {
  try {
    return await apiGet<IAdvertisingSettings>(`${ENV.API_BASE_URL}/users/me/advertising`);
  } catch {
    return { ...DEFAULT_ADVERTISING };
  }
};

export const updateAdvertisingSettingsOnAPI = async (
  settings: Partial<IAdvertisingSettings>
): Promise<IAdvertisingSettings> => {
  try {
    return await apiPatch<IAdvertisingSettings>(
      `${ENV.API_BASE_URL}/users/me/advertising`,
      settings
    );
  } catch {
    return { ...DEFAULT_ADVERTISING, ...settings };
  }
};
