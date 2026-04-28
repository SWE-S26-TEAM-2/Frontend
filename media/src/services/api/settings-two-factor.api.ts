import type { ITwoFactorSettings } from "@/types/settings-two-factor.types";
import { ENV } from "@/config/env";
import { apiGet, apiPatch } from "./apiClient";

const DEFAULT_TWO_FACTOR: ITwoFactorSettings = { isEnabled: false };

export const getTwoFactorSettingsFromAPI = async (): Promise<ITwoFactorSettings> => {
  try {
    return await apiGet<ITwoFactorSettings>(`${ENV.API_BASE_URL}/users/me/two-factor`);
  } catch {
    return { ...DEFAULT_TWO_FACTOR };
  }
};

export const updateTwoFactorSettingsOnAPI = async (
  settings: Partial<ITwoFactorSettings>
): Promise<ITwoFactorSettings> => {
  try {
    return await apiPatch<ITwoFactorSettings>(
      `${ENV.API_BASE_URL}/users/me/two-factor`,
      settings
    );
  } catch {
    return { ...DEFAULT_TWO_FACTOR, ...settings };
  }
};
