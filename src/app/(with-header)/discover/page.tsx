"use client";

import { useEffect, useState, useTransition } from "react";
import { trackService } from "@/services/di";
import { usePlayerStore } from "@/store/playerStore";
import { formatNumber } from "@/utils/formatNumber";
import { formatDuration } from "@/utils/formatDuration";
import type { ITrack } from "@/types/track.types";

const FEATURED_GENRES = ["electronic", "hip-hop-rap", "pop", "rock", "house", "ambient"];

function TrackRow({ track, index }: { track: ITrack; index: number }) {
  const setTrack = usePlayerStore((s) => s.setTrack);
  return (
    <div
      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-(--sc-bg-elevated) transition-colors cursor-pointer group"
      onClick={() => setTrack(track)}
    >
      <span className="text-xs text-(--sc-text-muted) w-5 text-right flex-shrink-0">{index + 1}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={track.albumArt || "/placeholder-track.png"}
        alt={track.title}
        className="w-9 h-9 rounded object-cover flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-track.png"; }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-(--sc-text) truncate group-hover:text-orange-400 transition-colors">
          {track.title}
        </p>
        <p className="text-xs text-(--sc-text-muted) truncate">{track.artist}</p>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-xs text-(--sc-text-muted) flex-shrink-0">
        <span>{formatDuration(track.duration)}</span>
        <span>▶ {formatNumber(track.plays)}</span>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
          <div className="w-5 h-3 bg-(--sc-bg-elevated) rounded" />
          <div className="w-9 h-9 bg-(--sc-bg-elevated) rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-(--sc-bg-elevated) rounded w-32" />
            <div className="h-2 bg-(--sc-bg-elevated) rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiscoverPage() {
  const [trending, setTrending] = useState<ITrack[]>([]);
  const [genreTracks, setGenreTracks] = useState<Record<string, ITrack[]>>({});
  const [isPending, startTransition] = useTransition();
  const setTrack = usePlayerStore((s) => s.setTrack);
  const setQueue = usePlayerStore((s) => s.setQueue);

  useEffect(() => {
    startTransition(async () => {
      const [trendingData, ...genreData] = await Promise.all([
        trackService.getTrending(10),
        ...FEATURED_GENRES.map((g) => trackService.getByGenre(g)),
      ]);
      setTrending(trendingData);
      const map: Record<string, ITrack[]> = {};
      FEATURED_GENRES.forEach((g, i) => { map[g] = genreData[i].slice(0, 6); });
      setGenreTracks(map);
    });
  }, []);

  const hero = trending[0];

  return (
    <div className="bg-(--sc-bg) min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-28">

        {/* Hero */}
        {hero && (
          <div
            className="relative rounded-xl overflow-hidden mb-8 h-48 sm:h-64 flex items-end cursor-pointer"
            style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)` }}
            onClick={() => { setQueue(trending); setTrack(hero); }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.albumArt} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 p-6">
              <p className="text-xs uppercase tracking-widest text-orange-400 font-semibold mb-1">Trending Now</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{hero.title}</h2>
              <p className="text-sm text-gray-300">{hero.artist}</p>
              <button
                className="mt-3 px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
                onClick={(e) => { e.stopPropagation(); setQueue(trending); setTrack(hero); }}
              >
                ▶ Play
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Trending column */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-(--sc-text)">Trending</h2>
              <button
                onClick={() => { setQueue(trending); if (trending[0]) setTrack(trending[0]); }}
                className="text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                Play all
              </button>
            </div>
            {isPending ? (
              <SectionSkeleton />
            ) : (
              <div>
                {trending.map((t, i) => <TrackRow key={t.id} track={t} index={i} />)}
              </div>
            )}
          </div>

          {/* Genre columns */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURED_GENRES.map((genre) => (
              <div key={genre}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-(--sc-text) capitalize">
                    {genre.replace(/-/g, " & ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h3>
                  <button
                    onClick={() => {
                      const tracks = genreTracks[genre] ?? [];
                      setQueue(tracks);
                      if (tracks[0]) setTrack(tracks[0]);
                    }}
                    className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Play all
                  </button>
                </div>
                {isPending ? (
                  <SectionSkeleton />
                ) : (
                  <div>
                    {(genreTracks[genre] ?? []).map((t, i) => (
                      <TrackRow key={t.id} track={t} index={i} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
