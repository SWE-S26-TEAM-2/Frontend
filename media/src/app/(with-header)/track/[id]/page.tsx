"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { trackService } from "@/services";

import TrackPlayer from "@/components/Track/TrackPlayer";
import TrackActions from "@/components/Track/TrackActions";
import RelatedTracks from "@/components/Track/RelatedTracks";
import CommentSection from "@/components/Track/CommentSection";
import type { ITrack } from "@/types/track.types";

export default function TrackPage() {
  const params = useParams();
  const id = params?.id as string;

  const [track, setTrack] = useState<ITrack | null>(null);
  const [related, setRelated] = useState<ITrack[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchTrack() {
      try {
        const [t, r] = await Promise.all([
          trackService.getById(id),
          trackService.getRelated(id),
        ]);
        setTrack(t);
        setRelated(r);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTrack();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-(--sc-bg) min-h-screen flex items-center justify-center">
        <div className="text-white opacity-60">Loading...</div>
      </div>
    );
  }

  if (error || !track) return notFound();

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
