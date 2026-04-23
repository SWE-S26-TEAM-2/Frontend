'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { studioService, playlistService } from '@/services';
import type { IPlaylist } from '@/types/studio.types';
import type { TrackVisibility } from '@/types/upload.types';

interface IStudioAddToPlaylistPanelProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
}

type PanelView = 'list' | 'create';

interface ICreateForm {
  title: string;
  description: string;
  privacy: TrackVisibility;
  artwork: File | null;
}

const DEFAULT_CREATE_FORM: ICreateForm = {
  title: '',
  description: '',
  privacy: 'public',
  artwork: null,
};

export default function StudioAddToPlaylistPanel({
  selectedCount,
  selectedIds,
  onClose,
}: IStudioAddToPlaylistPanelProps) {
  const artworkInputRef = useRef<HTMLInputElement>(null);

  // ── List view state ───────────────────────────────────────────────────────
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // ── Create view state ─────────────────────────────────────────────────────
  const [view, setView] = useState<PanelView>('list');
  const [createForm, setCreateForm] = useState<ICreateForm>(DEFAULT_CREATE_FORM);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  const isSaveEnabled = createForm.title.trim().length > 0;

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const data = await studioService.getPlaylists();
        setPlaylists(data);
      } catch (err) {
        console.error('[AddToPlaylist] failed to load playlists:', err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchPlaylists();
  }, []);

  // ── Handlers: list view ───────────────────────────────────────────────────

  const handleAdd = async (playlist: IPlaylist) => {
    if (addedIds.has(playlist.id)) return;
    setAddingId(playlist.id);
    try {
      await studioService.addTracksToPlaylist(playlist.id, selectedIds);
      setAddedIds((prev) => new Set(prev).add(playlist.id));
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlist.id
            ? { ...p, trackCount: p.trackCount + selectedIds.length }
            : p
        )
      );
    } catch (err) {
      console.error('[AddToPlaylist] failed to add tracks:', err);
    } finally {
      setAddingId(null);
    }
  };

  // ── Handlers: create view ─────────────────────────────────────────────────

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreateForm((prev) => ({ ...prev, artwork: file }));
    setArtworkPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!isSaveEnabled) return;
    setIsSaving(true);
    setCreateError('');
    try {
      const created = await playlistService.createPlaylist(
        createForm.title.trim(),
        createForm.description.trim() || undefined,
      );

      // Add selected tracks to the newly created playlist
      if (selectedIds.length > 0) {
        await studioService.addTracksToPlaylist(created.id, selectedIds);
      }

      const newPlaylist: IPlaylist = {
        id: created.id,
        title: created.title,
        trackCount: selectedIds.length,
        artworkUrl: created.artworkUrl ?? artworkPreview ?? undefined,
        visibility: createForm.privacy,
      };

      setPlaylists((prev) => [newPlaylist, ...prev]);
      setAddedIds((prev) => new Set(prev).add(newPlaylist.id));
      setCreateForm(DEFAULT_CREATE_FORM);
      setArtworkPreview(null);
      setView('list');
    } catch (err) {
      console.error('[CreatePlaylist] failed:', err);
      setCreateError('Failed to create playlist. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToList = () => {
    setCreateForm(DEFAULT_CREATE_FORM);
    setArtworkPreview(null);
    setCreateError('');
    setView('list');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#111] flex flex-col shadow-2xl animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a2a] shrink-0">
          {view === 'create' ? (
            <button
              type="button"
              onClick={handleBackToList}
              aria-label="Back to playlist list"
              className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            </button>
          )}

          <h2 className="text-white text-base font-bold">
            Add {selectedCount} {selectedCount === 1 ? 'track' : 'tracks'} to playlist
          </h2>
          {/* spacer to centre title */}
          <div className="w-8" aria-hidden="true" />
        </div>

        {/* ── List view ── */}
        {view === 'list' && (
          <div className="flex-1 overflow-y-auto">

            {/* Create playlist row */}
            <button
              type="button"
              onClick={() => setView('create')}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#1a1a1a] transition-colors duration-150 border-b border-[#1e1e1e]"
            >
              <div className="w-16 h-16 rounded-sm bg-[#2a2a2a] flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="text-white text-sm font-semibold">Create playlist</span>
            </button>

            {/* Playlist list */}
            {isLoading ? (
              <div className="flex flex-col">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[#1e1e1e]">
                    <div className="w-16 h-16 rounded-sm bg-[#1a1a1a] animate-pulse shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-3 bg-[#1a1a1a] rounded animate-pulse w-2/3" />
                      <div className="h-2 bg-[#1a1a1a] rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              playlists.map((playlist) => {
                const isAdded = addedIds.has(playlist.id);
                const isAdding = addingId === playlist.id;

                return (
                  <div
                    key={playlist.id}
                    className="flex items-center gap-4 px-6 py-4 border-b border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors duration-150"
                  >
                    {/* Artwork */}
                    <div className="relative w-16 h-16 rounded-sm bg-[#2a2a2a] overflow-hidden shrink-0">
                      {playlist.artworkUrl ? (
                        <Image
                          src={playlist.artworkUrl}
                          alt={playlist.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                          </svg>
                        </div>
                      )}
                      {playlist.visibility === 'private' && (
                        <div className="absolute bottom-0 right-0 bg-black/70 rounded-tl-sm p-0.5" aria-label="Private">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{playlist.title}</p>
                      <p className="text-[#999] text-xs mt-0.5">
                        {playlist.trackCount} {playlist.trackCount === 1 ? 'track' : 'tracks'}
                      </p>
                    </div>

                    {/* Add / Added button */}
                    <button
                      type="button"
                      onClick={() => handleAdd(playlist)}
                      disabled={isAdding || isAdded}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${
                        isAdded
                          ? 'bg-[#2a2a2a] text-white border border-[#2a2a2a]'
                          : 'border border-white text-white hover:bg-white hover:text-black disabled:opacity-50'
                      }`}
                    >
                      {isAdding ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : isAdded ? (
                        'Added'
                      ) : (
                        'Add to playlist'
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Create view ── */}
        {view === 'create' && (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

              {/* Artwork */}
              <div className="flex justify-center">
                {artworkPreview ? (
                  <div className="relative w-48 h-48 rounded-sm overflow-hidden bg-black">
                    <Image
                      src={artworkPreview}
                      alt="Playlist artwork preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setArtworkPreview(null);
                        setCreateForm((prev) => ({ ...prev, artwork: null }));
                        if (artworkInputRef.current) artworkInputRef.current.value = '';
                      }}
                      aria-label="Remove artwork"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <line x1="1" y1="1" x2="11" y2="11" />
                        <line x1="11" y1="1" x2="1" y2="11" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => artworkInputRef.current?.click()}
                    className="w-48 h-48 border-2 border-dashed border-[#444] rounded-sm flex flex-col items-center justify-center gap-3 hover:border-[#666] transition-colors"
                    aria-label="Upload playlist artwork"
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-white text-sm font-semibold">Add new artwork</span>
                  </button>
                )}
                <input
                  ref={artworkInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleArtworkChange}
                  aria-hidden="true"
                />
              </div>

              {/* Playlist title */}
              <div>
                <label className="text-white text-sm font-bold mb-2 flex items-center gap-1">
                  Playlist title
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="Describe your playlist."
                  className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors resize-none placeholder-[#555]"
                />
              </div>

              {/* Playlist privacy */}
              <div>
                <label className="text-white text-sm font-bold mb-3 block">Playlist privacy</label>
                <div className="flex rounded-full border border-[#333] overflow-hidden">
                  {(['public', 'private'] as TrackVisibility[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCreateForm((prev) => ({ ...prev, privacy: opt }))}
                      className={`flex-1 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                        createForm.privacy === opt
                          ? 'bg-white text-black'
                          : 'text-[#999] hover:text-white'
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {createError && (
                <p className="text-red-500 text-xs">{createError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-6 py-4 border-t border-[#2a2a2a] flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={!isSaveEnabled || isSaving}
                className="px-8 py-3 rounded-full text-sm font-bold transition-colors duration-150 disabled:cursor-not-allowed bg-white text-black hover:bg-[#e0e0e0] disabled:bg-[#2a2a2a] disabled:text-[#555]"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-[#555] border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </>
  );
}
