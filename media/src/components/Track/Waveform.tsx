"use client";

import { IWaveformProps } from "@/types/track.types";

export function Waveform({
  data,
  height = 52,
  playedPercent = 0,
  onSeek,
  playedColor = "#ff5500",
  unplayedColor = "#3a3a3a",
}: IWaveformProps) {
  const played = Math.floor(data.length * playedPercent);

  return (
    <div
      className="flex w-full cursor-pointer items-end"
      style={{ height, gap: "1px" }}
      onClick={(e) => {
        e.stopPropagation();
        if (!onSeek) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        onSeek(percent);
      }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px] transition-colors duration-150"
          style={{
            height: `${Math.max(2, v * height).toFixed(4)}px`,
            backgroundColor: i < played ? playedColor : unplayedColor,
          }}
        />
      ))}
    </div>
  );
}