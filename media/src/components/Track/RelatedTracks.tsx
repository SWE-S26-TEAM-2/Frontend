"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { IRelatedTracksProps } from "@/types/track.types";
import { usePlayerStore } from "@/store/playerStore";

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
          Related tracks: {sourceTrack?.title ?? "Track list"}
        </h2>

        {list.length === 0 ? (
          <p className="rounded border border-[#2e2e2e] bg-[#101010] p-4 text-sm text-[#9f9f9f]">
            No related tracks available.
          </p>
        ) : (
          <ul className="divide-y divide-[#1f1f1f] border-y border-[#1f1f1f] bg-[#0f0f0f]">
            {list.slice(0, 7).map((track, index) => {
              const isActiv = currentTrack?.id === track.id;


              return (
                <li key={`${track.id}-${index}`}>
                  <div className="flex flex-wrap items-center gap-3 px-2 py-3 sm:flex-nowrap sm:px-3">
                    <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:flex-1">
                      <span
                        className={`w-6 text-right text-sm font-semibold ${
                          (isActiv) ? "text-[#ff6b24]" : "text-[#727272]"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <Image
                        src={track.albumArt}
                        alt={track.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded object-cover"
                      />

                      <Link href={`/track/${track.id}`} className="min-w-0" onClick={() => setTrack(track)}>
                        <p
                          className={`truncate text-lg font-semibold ${
                            (isActiv) ? "text-[#ff6b24]" : "text-[#e5e5e5]"
                          }`}
                        >
                          {track.artist} · {track.title}
                        </p>
                      </Link>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <button className="rounded bg-[#242424] p-2 text-xs text-[#efefef]">♥</button>
                      <button className="rounded bg-[#242424] p-2 text-xs text-[#efefef]">↻</button>
                      <button className="rounded bg-[#242424] p-2 text-xs text-[#efefef]">↥</button>
                      <button className="rounded bg-[#242424] p-2 text-xs text-[#efefef]">⧉</button>
                      <button className="rounded bg-[#242424] p-2 text-xs text-[#efefef]">⋯</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <aside className="space-y-6">
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
