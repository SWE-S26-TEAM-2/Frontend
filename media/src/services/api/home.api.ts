import * as mocks from '../mocks/home.mocks';
import { IHomePageData, IArtist } from '../../types/home.types';

export const HomeAPI = {
  getHomePageData: async (username: string = "User"): Promise<IHomePageData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          moreOfWhatYouLike: mocks.MOCK_MORE_LIKE,
          recentlyPlayed: mocks.MOCK_RECENTLY_PLAYED,
          mixedForUser: mocks.MOCK_MIXED,
          discoverStations: mocks.MOCK_MIXED,
          followSuggestions: mocks.MOCK_FOLLOW_SUGGESTIONS,
          listeningHistory: mocks.MOCK_HISTORY,
        });
      }, 100); 
    });
  },

  refreshFollowSuggestions: async (): Promise<IArtist[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mocks.MOCK_FOLLOW_SUGGESTIONS), 100);
    });
  }
};