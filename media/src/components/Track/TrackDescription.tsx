import { ITrackDescriptionProps } from "@/types/track.types";

export default function TrackDescription({ track }: ITrackDescriptionProps) {
  return (
    <section className="rounded-xl border border-[#2b2b2b] bg-[#141414] p-5">
      <h2 className="text-base font-semibold text-white">Description</h2>
      <p className="mt-2 text-sm leading-6 text-[#c7c7c7]">
        {track.description ?? "No description has been added for this track yet."}
      </p>
    </section>
  );
}
