import { ITrackStatsProps } from "@/types/track.types";
import { formatNumber } from "@/utils/formatNumber";

export default function TrackStats({ track }: ITrackStatsProps) {
  return (
    <section className="grid grid-cols-3 gap-3 rounded-xl border border-[#2b2b2b] bg-[#141414] p-4 text-center">
      <div>
        <p className="text-xs uppercase tracking-wide text-[#8a8a8a]">Likes</p>
        <p className="mt-1 text-lg font-semibold text-white">{formatNumber(track.likes)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-[#8a8a8a]">Plays</p>
        <p className="mt-1 text-lg font-semibold text-white">{formatNumber(track.plays)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-[#8a8a8a]">Comments</p>
        <p className="mt-1 text-lg font-semibold text-white">{formatNumber(track.commentsCount ?? 0)}</p>
      </div>
    </section>
  );
}
