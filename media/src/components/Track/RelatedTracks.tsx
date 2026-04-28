"use client";

import { useEffect, useMemo } from "react";
import { IRelatedTracksProps } from "@/types/track.types";
import { usePlayerStore } from "@/store/playerStore";
import { TrackCard } from "@/components/Track/TrackCard";

export default function RelatedTracks({ tracks, sourceTrack }: IRelatedTracksProps) {
  const { currentTrack, setQueue, setTrack } = usePlayerStore();

  const list = useMemo(
    () =>
      sourceTrack ? [sourceTrack, ...tracks.filter((item) => item.id !== sourceTrack.id)] : tracks,
    [sourceTrack, tracks]
  );

  useEffect(() => {
    if (list.length === 0) return;
    setQueue(list);

    if (!currentTrack && sourceTrack) {
      setTrack(sourceTrack);
    }
  }, [currentTrack, list, setQueue, setTrack, sourceTrack]);

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white">
          Related tracks
        </h2>

        {list.length === 0 ? (
          <p className="rounded border border-[#2e2e2e] bg-[#101010] p-4 text-sm text-[#9f9f9f]">
            No related tracks available.
          </p>
        ) : (
          <div>
            {list.slice(0, 7).map((t) => (
              <TrackCard
                key={t.id}
                track={t}
                onPlay={(clicked) => { setQueue(list); setTrack(clicked); }}
              />
            ))}
          </div>
        )}
      </div>

      <aside className="hidden lg:block space-y-6">
        <p className="text-lg text-[#dddddd]">
          Based on {sourceTrack?.artist ?? "artist"} - {sourceTrack?.title ?? "track"}
        </p>

        <div className="rounded border border-[#2d2d2d] bg-[#141414] p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-linear-to-br from-[#e09f84] to-[#9ca7b1]" />
            <p className="text-2xl font-semibold text-white">{sourceTrack?.title ?? "Track Title"}</p>
          </div>
        </div>

        <div className="rounded border border-[#2d2d2d] bg-[#141414] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#b4b4b4]">Artists featured</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-linear-to-br from-[#de9a86] to-[#8fb6ca]" />
              <div>
                <p className="text-xl font-semibold text-white">{sourceTrack?.artist ?? "Sunny Black"}</p>
                <p className="text-sm text-[#9a9a9a]">268</p>
              </div>
            </div>
            <button className="rounded bg-white px-4 py-2 text-sm font-semibold text-black">Follow</button>
          </div>
        </div>
      </aside>
    </section>
  );
}
