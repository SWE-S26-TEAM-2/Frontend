/**
 * Station Store
 * Place at: store/stationStore.ts
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IStation } from "@/types/station.types";

// ── STATE INTERFACE ───────────────────────────────────────────────────────────

interface IStationStore {
  likedStationIds: Set<string>;
  likedStations:   IStation[];

  // Actions
  likeStation:   (station: IStation) => void;
  unlikeStation: (stationId: string) => void;
  toggleLike:    (station: IStation) => void;
  isLiked:       (stationId: string) => boolean;
}

// ── STORE ─────────────────────────────────────────────────────────────────────
// Uses persist middleware so liked stations survive page refresh.
// Set is not JSON-serializable so we persist likedStationIds as an array.

export const useStationStore = create<IStationStore>()(
  persist(
    (set, get) => ({
      likedStationIds: new Set<string>(),
      likedStations:   [],

      likeStation: (station: IStation) => {
        const { likedStationIds, likedStations } = get();
        if (likedStationIds.has(station.id)) return; // already liked

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
        isLiked(station.id) ? unlikeStation(station.id) : likeStation(station);
      },

      isLiked: (stationId: string) => get().likedStationIds.has(stationId),
    }),
    {
      name: "station-store",
      // Serialize Set as array for localStorage
      storage: {
        getItem: (name) => {
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
          const serialized = {
            ...value,
            state: {
              ...value.state,
              likedStationIds: [...value.state.likedStationIds],
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);