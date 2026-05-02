import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiPost, apiDelete } from "@/services/api/apiClient";
import type { IStation } from "@/types/station.types";

interface IStationStore {
  likedStationIds: Set<string>;
  likedStations:   IStation[];
  likeStation:     (station: IStation) => void;
  unlikeStation:   (stationId: string) => void;
  toggleLike:      (station: IStation) => void;
  isLiked:         (stationId: string) => boolean;
}

export const useStationStore = create<IStationStore>()(
  persist(
    (set, get) => ({
      likedStationIds: new Set<string>(),
      likedStations:   [],

      likeStation: (station: IStation) => {
        const { likedStationIds, likedStations } = get();
        if (likedStationIds.has(station.id)) return;
        set({
          likedStationIds: new Set([...likedStationIds, station.id]),
          likedStations:   [...likedStations, { ...station, isLiked: true }],
        });
      },

      unlikeStation: (stationId: string) => {
        const { likedStationIds, likedStations } = get();
        const next = new Set(likedStationIds);
        next.delete(stationId);
        set({
          likedStationIds: next,
          likedStations:   likedStations.filter((s) => s.id !== stationId),
        });
      },

      toggleLike: (station: IStation) => {
        const { isLiked, likeStation, unlikeStation } = get();
        const currentlyLiked = isLiked(station.id);

        // Optimistic UI update first
        if (currentlyLiked) {
          unlikeStation(station.id);
        } else {
          likeStation(station);
        }

        // Extract track_id from station.id ("station-{track_id}")
        // or use seedTrack.id directly which is more reliable
        const trackId = station.seedTrack?.id;
        if (!trackId) return;

        const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

        // Fire and forget — if it fails, UI stays optimistic
        // (acceptable UX for a like action)
        if (currentlyLiked) {
          void apiDelete(`${BASE}/likes/tracks/${trackId}`).catch(() => {});
        } else {
          void apiPost(`${BASE}/likes/tracks/${trackId}`).catch(() => {});
        }
      },

      isLiked: (stationId: string) => get().likedStationIds.has(stationId),
    }),
    {
      name: "station-store",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              likedStationIds: new Set(parsed.state.likedStationIds ?? []),
            },
          };
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          const serialized = {
            ...value,
            state: {
              ...value.state,
              likedStationIds: [...value.state.likedStationIds],
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(name);
        },
      },
    }
  )
);