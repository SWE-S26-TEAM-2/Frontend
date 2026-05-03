import { create } from "zustand";

interface ITrackEngagement {
  isLiked: boolean;
  likes: number;
  isReposted: boolean;
  reposts: number;
}

interface IEngagementStore {
  tracks: Record<string, ITrackEngagement>;
  /** Seed a track with server data. Only runs if the track isn't already tracked. */
  init: (trackId: string, data: Partial<ITrackEngagement>) => void;
  /** Apply a partial update (used by hooks for optimistic updates and rollbacks). */
  patch: (trackId: string, update: Partial<ITrackEngagement>) => void;
}

const DEFAULT_ENGAGEMENT: ITrackEngagement = {
  isLiked: false,
  likes: 0,
  isReposted: false,
  reposts: 0,
};

export const useEngagementStore = create<IEngagementStore>((set) => ({
  tracks: {},

  init: (trackId, data) =>
    set((state) => {
      // Don't overwrite state that the user has already interacted with this session
      if (state.tracks[trackId]) return state;
      return {
        tracks: {
          ...state.tracks,
          [trackId]: { ...DEFAULT_ENGAGEMENT, ...data },
        },
      };
    }),

  patch: (trackId, update) =>
    set((state) => ({
      tracks: {
        ...state.tracks,
        [trackId]: {
          ...(state.tracks[trackId] ?? DEFAULT_ENGAGEMENT),
          ...update,
        },
      },
    })),
}));
