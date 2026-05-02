"use client";

/**
 * Playlist Edit Page — /playlist/[id]/edit
 *
 * Domain: Playlists & Interactions — Phase 2
 * Loads the existing playlist via usePlaylistForm (edit mode),
 * pre-fills all fields, and on submit calls playlistService.update()
 * then redirects to /playlist/{id}.
 */

import { useParams } from "next/navigation";
import PlaylistForm from "@/components/playlist/PlaylistForm";
import PlaylistErrorBoundary from "@/components/playlist/PlaylistErrorBoundary";

export default function PlaylistEditPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  return (
    <PlaylistErrorBoundary>
      <PlaylistForm mode="edit" playlistId={id} />
    </PlaylistErrorBoundary>
  );
}
