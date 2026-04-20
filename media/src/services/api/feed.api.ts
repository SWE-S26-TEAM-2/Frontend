import { ENV } from "@/config/env";
import type { IFeedItem, IFeedService } from "@/types/feed.types";
import { apiGet } from "./apiClient";

export const realFeedService: IFeedService = {
  getFeed: async (filter = "all"): Promise<IFeedItem[]> => {
    try {
      return await apiGet<IFeedItem[]>(`${ENV.API_BASE_URL}/feed?filter=${filter}`);
    } catch {
      // Backend has no /feed endpoint yet — return empty
      return [];
    }
  },
};
