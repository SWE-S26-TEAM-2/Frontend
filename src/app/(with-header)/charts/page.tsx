"use client";

import { useEffect, useState, useTransition } from "react";
import { chartService } from "@/services/di";
import { usePlayerStore } from "@/store/playerStore";
import { formatNumber } from "@/utils/formatNumber";
import type { IChart, IChartGenre, IChartPeriod } from "@/types/chart.types";

const GENRES: { value: IChartGenre; label: string }[] = [
  { value: "all-music",      label: "All music genres" },
  { value: "hip-hop-rap",    label: "Hip-hop & Rap" },
  { value: "pop",            label: "Pop" },
  { value: "electronic",     label: "Electronic" },
  { value: "house",          label: "House" },
  { value: "techno",         label: "Techno" },
  { value: "r-b-soul",       label: "R&B & Soul" },
  { value: "rock",           label: "Rock" },
  { value: "alternative-rock", label: "Alternative Rock" },
  { value: "indie",          label: "Indie" },
  { value: "jazz-blues",     label: "Jazz & Blues" },
  { value: "classical",      label: "Classical" },
  { value: "ambient",        label: "Ambient" },
  { value: "drum-bass",      label: "Drum & Bass" },
  { value: "trance",         label: "Trance" },
  { value: "trap",           label: "Trap" },
  { value: "reggae",         label: "Reggae" },
  { value: "latin",          label: "Latin" },
  { value: "country",        label: "Country" },
  { value: "metal",          label: "Metal" },
];

function RankBadge({ delta, change }: { delta: number; change: string }) {
  if (change === "new") return (
    <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-orange-500/20 text-orange-400">NEW</span>
  );
  if (change === "same" || delta === 0) return (
    <span className="text-xs text-(--sc-text-muted)">—</span>
  );
  const up = delta > 0;
  return (
    <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${up ? "text-green-400" : "text-red-400"}`}>
      {up ? "▲" : "▼"}{Math.abs(delta)}
    </span>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-lg bg-(--sc-bg-elevated) animate-pulse">
          <div className="w-6 h-4 bg-(--sc-bg) rounded" />
          <div className="w-10 h-10 bg-(--sc-bg) rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-(--sc-bg) rounded w-40" />
            <div className="h-2 bg-(--sc-bg) rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChartsPage() {
  const [genre, setGenre] = useState<IChartGenre>("all-music");
  const [period, setPeriod] = useState<IChartPeriod>("top50");
  const [chart, setChart] = useState<IChart | null>(null);
  const [isPending, startTransition] = useTransition();
  const setTrack = usePlayerStore((s) => s.setTrack);
  const setQueue = usePlayerStore((s) => s.setQueue);

  useEffect(() => {
    startTransition(async () => {
      const data = await chartService.getChart(genre, period);
      setChart(data);
    });
  }, [genre, period]);

  const handlePlayAll = () => {
    if (!chart) return;
    const tracks = chart.entries.map((e) => e.track);
    setQueue(tracks);
    if (tracks[0]) setTrack(tracks[0]);
  };

  return (
    <div className="bg-(--sc-bg) min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 pb-28">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-(--sc-text)">Charts</h1>
          {chart && (
            <button
              onClick={handlePlayAll}
              className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              ▶ Play all
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Period toggle */}
          <div className="flex rounded-full border border-(--sc-border) overflow-hidden">
            {(["top50", "new-hot"] as IChartPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-orange-500 text-white"
                    : "text-(--sc-text-muted) hover:text-(--sc-text)"
                }`}
              >
                {p === "top50" ? "Top 50" : "New & Hot"}
              </button>
            ))}
          </div>

          {/* Genre selector */}
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as IChartGenre)}
            className="bg-(--sc-bg-elevated) border border-(--sc-border) text-(--sc-text) text-sm rounded-full px-4 py-1.5 outline-none cursor-pointer"
          >
            {GENRES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        {/* Chart list */}
        {isPending || !chart ? (
          <ChartSkeleton />
        ) : (
          <div className="space-y-1">
            {chart.entries.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-(--sc-bg-elevated) transition-colors group cursor-pointer"
                onClick={() => setTrack(entry.track)}
              >
                {/* Rank */}
                <div className="w-6 text-right text-sm font-bold text-(--sc-text-muted) flex-shrink-0">
                  {entry.rank}
                </div>

                {/* Delta */}
                <div className="w-10 flex justify-center flex-shrink-0">
                  <RankBadge delta={entry.rankDelta} change={entry.rankChange} />
                </div>

                {/* Art */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.track.albumArt || "/placeholder-track.png"}
                  alt={entry.track.title}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-track.png"; }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-(--sc-text) truncate group-hover:text-orange-400 transition-colors">
                    {entry.track.title}
                  </p>
                  <p className="text-xs text-(--sc-text-muted) truncate">{entry.track.artist}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-xs text-(--sc-text-muted)">
                  <span>♥ {formatNumber(entry.track.likes)}</span>
                  <span>▶ {formatNumber(entry.track.plays)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
