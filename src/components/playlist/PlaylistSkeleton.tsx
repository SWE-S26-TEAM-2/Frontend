"use client";

/**
 * PlaylistSkeleton — skeleton loading state for the playlist detail view.
 *
 * Mirrors the exact layout of the real playlist page:
 *  - Header: cover art block + metadata lines + action button placeholders
 *  - Track list: shimmer rows matching PlaylistTrackItem grid
 *
 * Accessibility: role="status" + aria-live so screen readers
 * announce loading without vocalising meaningless shapes.
 */

const TRACK_SKELETON_ROWS = 7;

export default function PlaylistSkeleton() {
  return (
    <div
      className="pl-skeleton"
      role="status"
      aria-live="polite"
    >
      {/* ── Header skeleton ── */}
      <div className="pl-skeleton__header">
        <div className="pl-skeleton__inner">
          <div className="pl-skeleton__cover pl-skeleton__pulse" />

          <div className="pl-skeleton__meta">
            <div className="pl-skeleton__line pl-skeleton__line--label pl-skeleton__pulse" />
            <div className="pl-skeleton__line pl-skeleton__line--title pl-skeleton__pulse" />
            <div className="pl-skeleton__line pl-skeleton__line--desc pl-skeleton__pulse" />
            <div className="pl-skeleton__line pl-skeleton__line--desc pl-skeleton__pulse" />
            <div className="pl-skeleton__line pl-skeleton__line--sub pl-skeleton__pulse" />

            <div className="pl-skeleton__actions">
              <div className="pl-skeleton__btn pl-skeleton__pulse" />
              <div className="pl-skeleton__btn pl-skeleton__btn--ghost pl-skeleton__pulse" />
              <div className="pl-skeleton__btn pl-skeleton__btn--ghost pl-skeleton__pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Track list skeleton ── */}
      <div className="pl-skeleton__tracklist">
        {Array.from({ length: TRACK_SKELETON_ROWS }).map((_, i) => (
          <div key={i} className="pl-skeleton__track-row">
            <div className="pl-skeleton__track-index pl-skeleton__pulse" />
            <div className="pl-skeleton__track-cover pl-skeleton__pulse" />
            <div className="pl-skeleton__track-info">
              <div className="pl-skeleton__line pl-skeleton__line--track-title pl-skeleton__pulse" />
              <div className="pl-skeleton__line pl-skeleton__line--track-artist pl-skeleton__pulse" />
            </div>
            <div className="pl-skeleton__track-duration pl-skeleton__pulse" />
          </div>
        ))}
      </div>

      {/* Visually hidden text for screen readers */}
      <span className="pl-skeleton__sr-only">Loading playlist content…</span>
    </div>
  );
}
