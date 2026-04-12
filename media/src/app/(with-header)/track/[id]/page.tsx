import { trackService } from "@/services";
import { notFound } from "next/navigation";

import TrackPlayer from "@/components/Track/TrackPlayer";
import TrackActions from "@/components/Track/TrackActions";
import RelatedTracks from "@/components/Track/RelatedTracks";
import CommentSection from "@/components/Track/CommentSection";
import type { ITrackPageProps } from "@/types/ui.types";

export default async function TrackPage({ params }: ITrackPageProps) {
  const { id } = await params;

  let track;
  let related;

  try {
    track = await trackService.getById(id);
    related = await trackService.getRelated(id);
  } catch {
    return notFound();
  }

  if (!track) return notFound();

  return (
    <div className="bg-(--sc-bg)">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-24 pt-3 text-white sm:px-6 sm:pt-5">
        <TrackPlayer track={track} />
        <TrackActions track={track} />
        <RelatedTracks tracks={related} sourceTrack={track} />
        <CommentSection trackId={id} />
      </div>
    </div>
  );
}
