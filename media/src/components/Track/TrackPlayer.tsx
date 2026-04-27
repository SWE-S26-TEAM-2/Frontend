"use client";

import Image from "next/image";
import { ITrack } from "@/types/track.types";
import { usePlayerStore } from "@/store/playerStore";
import { seededWaveform } from "@/utils/seededWaveform";
import { Waveform } from "./Waveform";

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function TrackPlayer({ track }: { track: ITrack }) {
  const { currentTrack, isPlaying, currentTime, duration, setTrack, setCurrentTime, togglePlay } =
    usePlayerStore();

  const isCurrent = currentTrack?.id === track.id;
  const sampleCount = Math.max(180, Math.min(320, Math.floor(track.duration * 1.5)));
  const waveform = seededWaveform(Number(track.id) || 1, sampleCount);
  const effectiveDuration = isCurrent && duration > 0 ? duration : track.duration;
  const playedPercent =
    isCurrent && effectiveDuration > 0
      ? Math.max(0, Math.min(1, currentTime / effectiveDuration))
      : 0;

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      setTrack(track);
    }
  };

  const handleSeek = (percent: number) => {
    if (!isCurrent) {
      setTrack(track);
    }
    setCurrentTime(percent * effectiveDuration);
  };

  return (
    <section className="overflow-hidden rounded-sm border border-[#6f665f] bg-[#92867b] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-2">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <button
              onClick={handleClick}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#101010] text-3xl text-white transition hover:brightness-110"
              aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
            >
              <span className="-ml-0.5">{isCurrent && isPlaying ? "❚❚" : "▶"}</span>
            </button>

            <div className="min-w-0 pt-1">
              <div className="inline-flex max-w-full items-center gap-2 bg-black px-3 py-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-[2.5rem] sm:leading-none">
                  Related tracks: {track.title}
                </h1>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="rounded bg-black/75 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[#9f9f9f]">
                  Private
                </span>
                <span className="truncate bg-black px-3 py-1 text-sm font-semibold text-[#dddddd] sm:text-2xl sm:font-bold sm:leading-none">
                  {track.artist}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-sm bg-transparent sm:mt-10">
            <Waveform
              data={waveform}
              height={88}
              playedPercent={playedPercent}
              onSeek={handleSeek}
              playedColor="#ff5500"
              unplayedColor="#f2f2f2"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-black/85">
              <span className="rounded bg-black px-1.5 py-0.5 text-[#ff6b24]">{formatTime(currentTime)}</span>
              <span className="rounded bg-black px-1.5 py-0.5 text-[#ffffff]">{formatTime(effectiveDuration)}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-85 items-center justify-center lg:justify-end">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.title}
              width={340}
              height={340}
              className="aspect-square w-full max-w-85 rounded-sm border border-[#7d6f66] object-cover shadow-[0_10px_26px_rgba(0,0,0,0.32)]"
            />
          ) : (
            <div className="aspect-square w-full max-w-85 rounded-sm border border-[#7d6f66] shadow-[0_10px_26px_rgba(0,0,0,0.32)] bg-gradient-to-br from-[#1a1a2e] to-[#2d1b4e] flex items-center justify-center">
              <svg width={80} height={80} viewBox="0 0 24 24" fill="#ffffff15">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}