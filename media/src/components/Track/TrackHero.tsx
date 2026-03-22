"use client";

import { ITrack } from "@/types/track.types";
import { usePlayer } from "@/context/PlayerContext";
import { seededWaveform } from "@/utils/seededWaveform";
import { Waveform } from "./Waveform";
import Image from "next/image";

export default function TrackHero({ track }: { track: ITrack }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const isCurrent = currentTrack?.id === track.id;
  const waveform = seededWaveform(Number(track.id) || 1);

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track);
  };

  return (
    <section className="flex justify-between bg-[#8a7f75] p-6 rounded-lg">
      
      {/* LEFT */}
      <div className="flex flex-col flex-1 gap-4">
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleClick}
            className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl"
          >
            {isCurrent && isPlaying ? "❚❚" : "▶"}
          </button>

          <div>
            <h1 className="text-2xl font-bold text-white">{track.title}</h1>
            <p className="text-gray-200">{track.artist}</p>
          </div>
        </div>

        <Waveform data={waveform} height={80} />
      </div>

      {/* RIGHT COVER */}
      <Image
        src={track.albumArt}
        alt={`${track.title} by ${track.artist}`}
        width={160}
        height={160}
        className="object-cover rounded"
      />
    </section>
  );
}