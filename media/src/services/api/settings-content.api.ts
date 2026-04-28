import type { IContentSettings } from "@/types/settings-content.types";
import { ENV } from "@/config/env";
import { apiGet, apiPatch } from "./apiClient";

const DEFAULT_CONTENT: IContentSettings = {
  rssUrl: "",
  emailDisplay: "don't display",
  customFeedTitle: "",
  category: "",
  statsServiceUrl: "",
  customAuthorName: "",
  language: "en",
  subscriberRedirect: "",
  explicitContent: false,
  includeInRSS: true,
  creativeCommons: false,
};

export const getContentSettingsFromAPI = async (): Promise<IContentSettings> => {
  try {
    return await apiGet<IContentSettings>(`${ENV.API_BASE_URL}/users/me/content`);
  } catch {
    return { ...DEFAULT_CONTENT };
  }
};

export const updateContentSettingsOnAPI = async (
  settings: Partial<IContentSettings>
): Promise<IContentSettings> => {
  try {
    return await apiPatch<IContentSettings>(`${ENV.API_BASE_URL}/users/me/content`, settings);
  } catch {
    return { ...DEFAULT_CONTENT, ...settings };
  }
};
