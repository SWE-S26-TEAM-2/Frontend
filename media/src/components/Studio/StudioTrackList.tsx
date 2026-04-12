'use client';

import { useState } from 'react';
import StudioTrackRow from './StudioTrackRow';
import StudioDeleteModal from './StudioDeleteModal';
import { studioService } from '@/services';
import type { IStudioTrack } from '@/types/studio.types';

interface IStudioTrackListProps {
  tracks: IStudioTrack[];
  total: number;
  onTracksChange: (updatedTracks: IStudioTrack[]) => void;
}

export default function StudioTrackList({ tracks, total, onTracksChange }: IStudioTrackListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [trackToDelete, setTrackToDelete] = useState<IStudioTrack | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const allSelected = tracks.length > 0 && selectedIds.size === tracks.length;
  const someSelected = selectedIds.size > 0;

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(tracks.map((t) => t.id)) : new Set());
  };

  const handleSelectOne = (trackId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(trackId);
      else next.delete(trackId);
      return next;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!trackToDelete) return;
    setIsDeleting(true);
    try {
      await studioService.deleteTrack(trackToDelete.id);
      const updated = tracks.filter((t) => t.id !== trackToDelete.id);
      onTracksChange(updated);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(trackToDelete.id);
        return next;
      });
    } catch (err) {
      console.error('[Studio] delete failed:', err);
    } finally {
      setIsDeleting(false);
      setTrackToDelete(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Column header / bulk toolbar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#2a2a2a]">
        {/* Select-all checkbox */}
        <div className="shrink-0 w-6 flex items-center justify-center">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            aria-label="Select all tracks"
            className="w-4 h-4 rounded border border-[#555] bg-transparent accent-white cursor-pointer"
          />
        </div>

        {someSelected ? (
          /* ── Bulk action toolbar ── */
          <>
            <span className="text-white text-sm font-bold">
              {selectedIds.size} SELECTED
            </span>

            {/* Edit (stub) */}
            <button
              type="button"
              aria-label="Edit selected"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#2a2a2a] transition-colors text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Add to playlist (stub) */}
            <button
              type="button"
              aria-label="Add selected to playlist"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#2a2a2a] transition-colors text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
          </>
        ) : (
          /* ── Column headers ── */
          <>
            <span className="flex-1 text-[#999] text-xs font-bold tracking-widest uppercase">
              Tracks
            </span>
            <div className="shrink-0 w-20 text-center text-[#999] text-xs font-bold tracking-widest uppercase">
              Duration
            </div>
            <div className="shrink-0 w-28 text-center text-[#999] text-xs font-bold tracking-widest uppercase">
              Date
            </div>
            <div className="shrink-0 w-52 text-center text-[#999] text-xs font-bold tracking-widest uppercase">
              Engagements
            </div>
            <div className="shrink-0 w-12 text-center text-[#999] text-xs font-bold tracking-widest uppercase">
              Plays
            </div>
            {/* Spacer for three-dots column */}
            <div className="shrink-0 w-8" aria-hidden="true" />
          </>
        )}
      </div>

      {/* Track rows */}
      {tracks.map((track) => (
        <StudioTrackRow
          key={track.id}
          track={track}
          isSelected={selectedIds.has(track.id)}
          onSelect={handleSelectOne}
          onDeleteRequest={setTrackToDelete}
        />
      ))}

      {/* Track count */}
      <div className="px-4 py-3 text-[#555] text-xs">
        {total} {total === 1 ? 'track' : 'tracks'}
      </div>

      {/* Delete confirmation modal */}
      {trackToDelete && (
        <StudioDeleteModal
          trackTitle={trackToDelete.title}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTrackToDelete(null)}
        />
      )}
    </div>
  );
}
