// src/services/mocks/privacy.mock.ts

import { IPrivacySettings } from "@/types/settings-privacy.types";
import { MOCK_PRIVACY_SETTINGS } from "./mockData";

export const getMockPrivacySettings = async (): Promise<IPrivacySettings> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a copy of the mock data
      resolve({ ...MOCK_PRIVACY_SETTINGS });
    }, 500);
  });
};

export const updateMockPrivacySettings = async (
  settings: Partial<IPrivacySettings>
): Promise<IPrivacySettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Update the mock data with new values
      Object.assign(MOCK_PRIVACY_SETTINGS, settings);
      resolve({ ...MOCK_PRIVACY_SETTINGS });
    }, 500);
  });
};