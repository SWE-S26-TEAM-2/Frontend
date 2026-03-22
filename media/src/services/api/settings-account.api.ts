import { IAccountSettings } from "@/types/settings-account.types";

export const getAccountSettingsFromAPI = async (): Promise<IAccountSettings> => {
  console.log("🔵 API call: getAccountSettings");
  throw new Error("API not implemented yet");
};

export const updateAccountSettingsOnAPI = async (
  settings: Partial<IAccountSettings>
): Promise<IAccountSettings> => {
  console.log("🔵 API call: updateAccountSettings", settings);
  throw new Error("API not implemented yet");
};