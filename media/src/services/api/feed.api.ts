import { ENV } from "@/config/env";
import type { IFeedItem, IFeedService } from "@/types/feed.types";

export const realFeedService: IFeedService = {
  getFeed: async (filter = "all"): Promise<IFeedItem[]> => {
    const res = await fetch(`${ENV.API_BASE_URL}/feed?filter=${filter}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    });
    if (!res.ok) throw new Error("Failed to fetch feed");
    return res.json();
  },
};
