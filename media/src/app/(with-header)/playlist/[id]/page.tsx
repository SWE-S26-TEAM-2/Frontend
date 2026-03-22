"use client";

/**
 * Playlist Detail View — /playlist/[id]
 *
 * Domain: Playlists & Interactions
 * The Edit action is handled inside PlaylistHeader's action row.
 */

import { useParams } from "next/navigation";
import { usePlaylist } from "@/hooks/usePlaylist";
import PlaylistHeader from "@/components/playlist/PlaylistHeader";
import PlaylistTrackList from "@/components/playlist/PlaylistTrackList";
import PlaylistSkeleton from "@/components/playlist/PlaylistSkeleton";
import PlaylistErrorBoundary from "@/components/playlist/PlaylistErrorBoundary";

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
      <div className="playlist-page__state" role="alert">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
          className="playlist-page__error-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8"   x2="12"   y2="12" />
          <line x1="12" y1="16"  x2="12.01" y2="16" />
        </svg>

        <p className="playlist-page__state-text">
          {errorMessage || "Playlist not found."}
        </p>

        {canRetry && (
          <button
            className="playlist-header__btn playlist-header__btn--primary"
            onClick={handleRetry}
            aria-label="Retry loading the playlist"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
            </svg>
            Retry
            {retryCount > 0 && (
              <span className="playlist-page__retry-count">({retryCount}/3)</span>
            )}
          </button>
        )}

        {!canRetry && (
          <p className="playlist-page__state-text playlist-page__state-text--dim">
            Maximum retries reached. Please refresh the page.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="playlist-page">
      {/*
        PlaylistHeader renders all action buttons inline:
        [ Play All ]  [ Like ]  [ Share ]  [ Edit ]
        The Edit button navigates to /playlist/{id}/edit
      */}
      <PlaylistHeader
        playlist={playlist}
        tracks={tracks}
        canEdit={true}
      />

      <div className="playlist-page__body">
        <PlaylistTrackList
          tracks={tracks}
          onRemoveTrack={handleRemoveTrack}
        />
      </div>
    </div>
  );
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  return (
    <PlaylistErrorBoundary>
      <PlaylistView id={id} />
    </PlaylistErrorBoundary>
  );
}
