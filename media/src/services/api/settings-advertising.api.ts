import { IAdvertisingSettings } from "@/types/settings-advertising.types";

export const getAdvertisingSettingsFromAPI = async (): Promise<IAdvertisingSettings> => {
  console.error("🔵 API call: getAdvertisingSettings");
  throw new Error("API not implemented yet");
};

export const updateAdvertisingSettingsOnAPI = async (
  settings: Partial<IAdvertisingSettings>
): Promise<IAdvertisingSettings> => {
  console.error("🔵 API call: updateAdvertisingSettings", settings);
  throw new Error("API not implemented yet");
};