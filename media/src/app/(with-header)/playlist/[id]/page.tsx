"use client";

import { useParams } from "next/navigation";
import PlaylistErrorBoundary from "@/components/playlist/PlaylistErrorBoundary";
import PlaylistHeader from "@/components/playlist/PlaylistHeader";
import PlaylistSkeleton from "@/components/playlist/PlaylistSkeleton";
import PlaylistTrackList from "@/components/playlist/PlaylistTrackList";
import { usePlaylist } from "@/hooks/usePlaylist";

function PlaylistView({ id }: { id: string }) {
  const {
    playlist,
    tracks,
    isLoading,
    hasError,
    errorMessage,
    retryCount,
    canRetry,
    handleRetry,
    handleRemoveTrack,
  } = usePlaylist(id);

  if (isLoading) {
    return <PlaylistSkeleton />;
  }

  if (hasError || !playlist) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-5 px-6 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5 text-orange-400">
          <svg
            aria-hidden="true"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Playlist unavailable</h1>
          <p className="text-sm text-white/65">{errorMessage || "Playlist not found."}</p>
          {retryCount > 0 ? (
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              Retry {retryCount} of 3
            </p>
          ) : null}
        </div>
        {canRetry ? (
          <button
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            onClick={handleRetry}
            type="button"
          >
            Retry
          </button>
        ) : (
          <p className="text-sm text-white/45">Maximum retries reached. Refresh the page to try again.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6">
      <PlaylistHeader playlist={playlist} tracks={tracks} />
      <PlaylistTrackList onRemoveTrack={handleRemoveTrack} tracks={tracks} />
    </div>
  );
}

export default function PlaylistDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  return (
    <PlaylistErrorBoundary>
      <PlaylistView id={id} />
    </PlaylistErrorBoundary>
  );
}
