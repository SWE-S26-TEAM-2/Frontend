import { MOCK_FEED_ITEMS } from "./mockData";
import type { IFeedItem, IFeedService } from "@/types/feed.types";

export const mockFeedService: IFeedService = {
  getFeed: async (filter = "all"): Promise<IFeedItem[]> => {
    await new Promise((r) => setTimeout(r, 350));
    if (filter === "tracks")  return MOCK_FEED_ITEMS.filter((i) => i.type === "track");
    if (filter === "reposts") return MOCK_FEED_ITEMS.filter((i) => i.type === "repost");
    return MOCK_FEED_ITEMS;
  },
};
