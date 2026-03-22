import { ITrackHeaderProps } from "@/types/track.types";
import { timeAgo } from "@/utils/timeAgo";
import Image from "next/image";

export default function TrackHeader({ track }: ITrackHeaderProps) {
  return (
    <section className="flex gap-6 rounded-xl border border-[#2b2b2b] bg-[#171717] p-5">
      
      {/* Cover */}
      <Image
        src={track.albumArt}
        alt={track.title}
        width={128}
        height={128}
        className="rounded-lg object-cover"
      />

      {/* Info */}
      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-wide text-[#8f8f8f]">
          Now playing
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-white">
          {track.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#bbbbbb]">
          <span>{track.artist}</span>

          <span className="text-[#4d4d4d]">•</span>

          <span>{timeAgo(track.createdAt)}</span>

          {track.genre && (
            <span className="rounded-full border border-[#3a3a3a] px-2 py-0.5 text-xs text-[#cfcfcf]">
              {track.genre}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}