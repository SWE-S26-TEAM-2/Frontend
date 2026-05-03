"use client";

/**
 * Playlist Create Page — /playlist/create
 *
 * Domain: Playlists & Interactions — Phase 2
 * Renders an empty PlaylistForm in create mode.
 * On submit: calls playlistService.create() → redirects to /playlist/{newId}
 */

import PlaylistForm from "@/components/playlist/PlaylistForm";
import PlaylistErrorBoundary from "@/components/playlist/PlaylistErrorBoundary";

export default function PlaylistCreatePage() {
  return (
    <PlaylistErrorBoundary>
      <PlaylistForm mode="create" />
    </PlaylistErrorBoundary>
  );
}
