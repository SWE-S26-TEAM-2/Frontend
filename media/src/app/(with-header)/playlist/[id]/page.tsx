"use client";

/**
 * Playlist Detail View — /playlist/[id]
 *
 * Upgraded to use:
 *  - usePlaylistController (single source of truth, race-condition-safe)
 *  - useLikedPlaylists (like state hydrated from GET /playlists/liked)
 *  - usePlaylistSubscription (simulated real-time polling every 8s)
 *  - canEdit computed from playlist.creator vs localStorage (not hardcoded true)
 */

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { usePlaylistController } from "@/hooks/usePlaylistController";
import { useLikedPlaylists } from "@/hooks/useLikedPlaylists";
import { usePlaylistSubscription } from "@/hooks/usePlaylistSubscription";
import { playlistService } from "@/services/di";
import PlaylistHeader from "@/components/playlist/PlaylistHeader";
import PlaylistTrackList from "@/components/playlist/PlaylistTrackList";
import PlaylistSkeleton from "@/components/playlist/PlaylistSkeleton";
import PlaylistErrorBoundary from "@/components/playlist/PlaylistErrorBoundary";
import pageStyles from "@/components/playlist/PlaylistPage.module.css";
import headerStyles from "@/components/playlist/PlaylistHeader.module.css";

function PlaylistView({ id }: { id: string }) {
  const { state, actions, tracksAsPlaylistTracks } = usePlaylistController(playlistService);
  const { isLiked } = useLikedPlaylists(playlistService);

  // Simulated real-time: poll every 8s, hydrate on remote change
  const { hasRemoteChanges, acknowledgeChanges } = usePlaylistSubscription(
    id,
    playlistService,
    state.tracks,
    {
      hasLocalChanges: state.hasUnsavedChanges,
      onUpdate: () => { actions.hydrate(id); },
    },
  );

  useEffect(() => {
    if (id) actions.hydrate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Sync liked state once playlist ID is known
  useEffect(() => {
    if (state.playlistId) {
      actions.setLikeState(isLiked(state.playlistId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.playlistId]);

  const isInitialLoading = !state.playlistId && !state.error;

  if (isInitialLoading) {
    return <PlaylistSkeleton />;
  }

  if (state.error && !state.playlistId) {
    return (
      <div className={pageStyles.playlistPage__state} role="alert">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
          className={pageStyles.playlistPage__errorIcon}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className={pageStyles.playlistPage__stateText}>
          {state.error.message}
        </p>
        {state.error.retryable && (
          <button
            className={`${headerStyles.playlistHeader__btn} ${headerStyles["playlistHeader__btn--primary"]}`}
            onClick={() => actions.hydrate(id)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
            </svg>
            Retry
          </button>
        )}
      </div>
    );
  }

  const playlist = {
    id: state.playlistId ?? id,
    title: state.metadata.name,
    description: state.metadata.description,
    coverArt: state.metadata.coverUrl ?? undefined,
    creator: "",
    isPublic: true,
    tracks: tracksAsPlaylistTracks,
  };

  return (
    <div className={pageStyles.playlistPage}>
      {hasRemoteChanges && (
        <div
          style={{
            background: "var(--color-accent, #f90)",
            color: "#000",
            padding: "8px 16px",
            textAlign: "center",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
          onClick={acknowledgeChanges}
          role="status"
        >
          This playlist was updated — click to dismiss
        </div>
      )}

      <PlaylistHeader
        playlist={playlist}
        tracks={tracksAsPlaylistTracks}
        canEdit={state.canEdit}
        isLiked={state.likeState.isLiked}
        isLiking={state.likeState.isPending}
        onLike={() => { void actions.toggleLike(); }}
      />

      <div className={pageStyles.playlistPage__body}>
        <PlaylistTrackList
          tracks={tracksAsPlaylistTracks}
          onRemoveTrack={(trackId: string) => { void actions.removeTracks([trackId]); }}
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
