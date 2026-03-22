import { IContentSettings } from "@/types/settings-content.types";

export const getContentSettingsFromAPI = async (): Promise<IContentSettings> => {
  console.log("🔵 API call: getContentSettings");
  throw new Error("API not implemented yet");
};

export const updateContentSettingsOnAPI = async (
  settings: Partial<IContentSettings>
): Promise<IContentSettings> => {
  console.log("🔵 API call: updateContentSettings", settings);
  throw new Error("API not implemented yet");
};