import { IContentSettings } from "@/types/settings-content.types";

export const getContentSettingsFromAPI = async (): Promise<IContentSettings> => {
  console.error("🔵 API call: getContentSettings");
  throw new Error("API not implemented yet");
};

export const updateContentSettingsOnAPI = async (
  settings: Partial<IContentSettings>
): Promise<IContentSettings> => {
  console.error("🔵 API call: updateContentSettings", settings);
  throw new Error("API not implemented yet");
};