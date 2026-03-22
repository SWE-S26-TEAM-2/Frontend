import { IContentSettings } from "@/types/settings-content.types";
import { MOCK_CONTENT_SETTINGS } from "./mockData";

export const getMockContentSettings = async (): Promise<IContentSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...MOCK_CONTENT_SETTINGS });
    }, 500);
  });
};

export const updateMockContentSettings = async (
  settings: Partial<IContentSettings>
): Promise<IContentSettings> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(MOCK_CONTENT_SETTINGS, settings);
      resolve({ ...MOCK_CONTENT_SETTINGS });
    }, 500);
  });
};