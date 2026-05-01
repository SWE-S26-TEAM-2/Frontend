import type { IPrivacySettings } from "@/types/settings-privacy.types";
import { ENV } from "@/config/env";
import { apiGet, apiPatch } from "./apiClient";

const DEFAULT_PRIVACY: IPrivacySettings = {
  receiveMessages: true,
  showActivities: true,
  showTopFan: true,
  showTrackFans: true,
  blockedUsers: [],
};

export const getPrivacySettingsFromAPI = async (): Promise<IPrivacySettings> => {
  try {
    return await apiGet<IPrivacySettings>(`${ENV.API_BASE_URL}/users/me/privacy`);
  } catch {
    return { ...DEFAULT_PRIVACY };
  }
};

export const updatePrivacySettingsOnAPI = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  try {
    return await apiPatch<IPrivacySettings>(`${ENV.API_BASE_URL}/users/me/privacy`, settings);
  } catch {
    return { ...DEFAULT_PRIVACY, ...settings };
  }
};
