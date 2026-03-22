// src/services/api/privacy.api.ts

import { IPrivacySettings } from "@/types/privacy.types";

// For now, this will just log that API isn't ready
// Later you'll replace with real API calls

export const getPrivacySettingsFromAPI = async (): Promise<IPrivacySettings> => {
  console.warn("🔵 API call: getPrivacySettings");
  
  // TEMPORARY: Return empty data until backend is ready
  // Later this will be:
  // const response = await fetch(`${ENV.API_BASE_URL}/privacy-settings`);
  // return response.json();
  
  throw new Error("API not implemented yet");
};

export const updatePrivacySettingsOnAPI = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  console.warn("🔵 API call: updatePrivacySettings", settings);
  
  // TEMPORARY: Throw error until backend is ready
  // Later this will be:
  // const response = await fetch(`${ENV.API_BASE_URL}/privacy-settings`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(settings)
  // });
  // return response.json();
  
  throw new Error("API not implemented yet");
};