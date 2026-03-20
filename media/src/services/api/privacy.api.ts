// src/services/api/privacy.api.ts

import { IPrivacySettings } from "@/types/privacy.types";

/**
 * Real privacy settings API service.
 * These functions throw until the backend endpoint is ready.
 * Switch from mock to real by setting NEXT_PUBLIC_USE_MOCK_API=false.
 */

export const getPrivacySettingsFromAPI = async (): Promise<IPrivacySettings> => {
  // TODO: replace with real implementation when backend is ready:
  // const response = await fetch(`${ENV.API_BASE_URL}/privacy-settings`);
  // return response.json();
  throw new Error("Privacy settings API not implemented yet");
};

export const updatePrivacySettingsOnAPI = async (
  _settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  // TODO: replace with real implementation when backend is ready:
  // const response = await fetch(`${ENV.API_BASE_URL}/privacy-settings`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(_settings),
  // });
  // return response.json();
  throw new Error("Privacy settings API not implemented yet");
};
