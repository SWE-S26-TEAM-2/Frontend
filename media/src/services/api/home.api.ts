import axios from "axios";
import { ENV } from "@/config/env";
import * as mocks from "../mocks/home.mocks";
import { IHomeService, IHomePageData } from "@/types/home.types";

/* =========================
   MOCK SERVICE
========================= */
export const mockHomeService: IHomeService = {
  getHomePageData: async () => {
    return {
      moreOfWhatYouLike: mocks.MOCK_MORE_LIKE,
      recentlyPlayed: mocks.MOCK_RECENTLY_PLAYED,
      mixedForUser: mocks.MOCK_MIXED,
      discoverStations: mocks.MOCK_MIXED,
      followSuggestions: mocks.MOCK_FOLLOW_SUGGESTIONS,
      listeningHistory: mocks.MOCK_HISTORY,
    };
  },

  refreshFollowSuggestions: async () => {
    return mocks.MOCK_FOLLOW_SUGGESTIONS;
  },
};

/* =========================
   REAL SERVICE (PRODUCTION READY)
========================= */
export const realHomeService: IHomeService = {
  getHomePageData: async (): Promise<IHomePageData> => {
    try {
      const base = ENV.API_BASE_URL;

      const [recentlyPlayedRes, listeningHistoryRes, userRes] =
        await Promise.all([
          axios.get(`${base}/users/me/recently-played`),
          axios.get(`${base}/users/me/listening-history`),
          axios.get(`${base}/users/me`),
        ]);

      const normalizeTrack = (t: any) => ({
        ...t,
        type: "track",
      });

      return {
        moreOfWhatYouLike: [], // TODO: recommendation endpoint later
        recentlyPlayed: (recentlyPlayedRes.data || []).map(normalizeTrack),
        mixedForUser: [],
        discoverStations: [],
        followSuggestions: userRes.data?.followingUsers || [],
        listeningHistory: (listeningHistoryRes.data || []).map(normalizeTrack),
      };
    } catch (error) {
      console.error("❌ Home service failed:", error);

      return {
        moreOfWhatYouLike: [],
        recentlyPlayed: [],
        mixedForUser: [],
        discoverStations: [],
        followSuggestions: [],
        listeningHistory: [],
      };
    }
  },

  refreshFollowSuggestions: async () => {
    try {
      const base = ENV.API_BASE_URL;

      const res = await axios.get(`${base}/search/users`, {
        params: { q: "" },
      });

      return res.data || [];
    } catch (error) {
      console.error("❌ Follow suggestions failed:", error);
      return [];
    }
  },
};