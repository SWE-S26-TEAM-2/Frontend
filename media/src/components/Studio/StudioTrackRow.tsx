'use client';

import { useState } from 'react';
import Image from 'next/image';
import StudioTrackMenu from './StudioTrackMenu';
import type { IStudioTrack } from '@/types/studio.types';

interface IStudioTrackRowProps {
  track: IStudioTrack;
  isSelected: boolean;
  onSelect: (trackId: string, checked: boolean) => void;
  onDeleteRequest: (track: IStudioTrack) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function StudioTrackRow({
  track,
  isSelected,
  onSelect,
  onDeleteRequest,
}: IStudioTrackRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className={`
        relative flex items-center gap-4 px-4 py-3 border-b border-[#1e1e1e]
        transition-colors duration-100
        ${isSelected ? 'bg-[#1f1f1f]' : 'hover:bg-[#181818]'}
      `}
    >
      {/* Checkbox */}
      <div className="shrink-0 w-6 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(track.id, e.target.checked)}
          aria-label={`Select ${track.title}`}
          className="w-4 h-4 rounded border border-[#555] bg-transparent accent-white cursor-pointer"
        />
      </div>

      {/* Artwork */}
      <div className="shrink-0 w-12 h-12 bg-[#2a2a2a] rounded-sm overflow-hidden relative">
        {track.artworkUrl ? (
          <Image src={track.artworkUrl} alt={track.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
        )}

        {/* Private lock badge */}
        {track.visibility === 'private' && (
          <div className="absolute bottom-0 right-0 bg-black/70 rounded-tl-sm p-0.5" aria-label="Private track">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{track.title}</p>
        <p className="text-[#999] text-xs truncate mt-0.5">
          {track.processingStatus === 'processing' ? (
            <span className="text-[#f5a623]">Processing…</span>
          ) : (
            track.genre || <span className="text-[#555]">No genre</span>
          )}
        </p>
      </div>

      {/* Duration */}
      <div className="shrink-0 w-20 text-center">
        <span className="text-[#999] text-sm">
          {track.processingStatus === 'processing' ? '—' : formatDuration(track.duration)}
        </span>
      </div>

      {/* Date */}
      <div className="shrink-0 w-28 text-center">
        <span className="text-[#999] text-sm">{formatDate(track.createdAt)}</span>
      </div>

      {/* Engagements */}
      <div className="shrink-0 w-52 flex items-center justify-center gap-4">
        {/* Likes */}
        <div className="flex items-center gap-1 text-[#999] text-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{track.likes > 0 ? track.likes : '—'}</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-1 text-[#999] text-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>—</span>
        </div>

        {/* Reposts */}
        <div className="flex items-center gap-1 text-[#999] text-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>—</span>
        </div>

        {/* Downloads */}
        <div className="flex items-center gap-1 text-[#999] text-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="8 12 12 16 16 12" />
            <line x1="12" y1="8" x2="12" y2="16" />
          </svg>
          <span>—</span>
        </div>
      </div>

      {/* Plays */}
      <div className="shrink-0 w-12 text-center">
        <span className="text-white text-sm font-semibold">{track.plays}</span>
      </div>

      {/* Three-dots menu */}
      <div className="shrink-0 relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Track options"
          aria-expanded={isMenuOpen}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {isMenuOpen && (
          <StudioTrackMenu
            trackId={track.id}
            onDelete={() => onDeleteRequest(track)}
            onClose={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
