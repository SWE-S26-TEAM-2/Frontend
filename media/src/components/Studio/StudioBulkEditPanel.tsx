'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import StudioApplyChangesModal from './StudioApplyChangesModal';
import { studioService } from '@/services';
import type { BulkPrivacyOption, IBulkEditPayload } from '@/types/studio.types';

const GENRES = [
  'Alternative Rock', 'Ambient', 'Classical', 'Country', 'Dance & EDM',
  'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Electronic',
  'Hip-hop & Rap', 'House', 'Indie', 'Jazz & Blues', 'Latin', 'Metal',
  'Piano', 'Pop', 'R&B & Soul', 'Reggae', 'Reggaeton', 'Rock', 'Soundtrack',
  'Techno', 'Trance', 'Trap', 'Triphop', 'World',
];

interface IStudioBulkEditPanelProps {
  selectedCount: number;
  selectedIds: string[];
  onClose: () => void;
  onApplied: () => void;
}

const DEFAULT_PAYLOAD: IBulkEditPayload = {
  genre: '',
  tags: [],
  artwork: undefined,
  privacy: 'no-change',
};

export default function StudioBulkEditPanel({
  selectedCount,
  selectedIds,
  onClose,
  onApplied,
}: IStudioBulkEditPanelProps) {
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const [payload, setPayload] = useState<IBulkEditPayload>(DEFAULT_PAYLOAD);
  const [tagsInput, setTagsInput] = useState('');
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const isDirty =
    !!payload.genre ||
    !!tagsInput.trim() ||
    !!payload.artwork ||
    payload.privacy !== 'no-change';

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPayload((prev) => ({ ...prev, artwork: file }));
    setArtworkPreview(URL.createObjectURL(file));
  };

  const handlePrivacy = (value: BulkPrivacyOption) => {
    setPayload((prev) => ({ ...prev, privacy: value }));
  };

  const handleApplyConfirm = async () => {
    setIsApplying(true);
    try {
      await studioService.bulkEditTracks(selectedIds, {
        ...payload,
        tags: tagsInput.trim() ? tagsInput.split(',').map((t) => t.trim()) : [],
      });
      onApplied();
    } catch (err) {
      console.error('[BulkEdit] failed:', err);
    } finally {
      setIsApplying(false);
      setIsConfirmOpen(false);
    }
  };

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
          <h2 className="text-white text-base font-bold">Edit {selectedCount} tracks</h2>
          {/* spacer to center title */}
          <div className="w-8" aria-hidden="true" />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">

          {/* Artwork */}
          <div className="flex justify-center">
            {artworkPreview ? (
              <div className="relative w-48 h-48 rounded-sm overflow-hidden bg-black">
                <Image src={artworkPreview} alt="Artwork preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setArtworkPreview(null);
                    setPayload((prev) => ({ ...prev, artwork: undefined }));
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
                aria-label="Upload artwork"
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

          {/* Primary genre */}
          <div>
            <label className="text-white text-sm font-bold mb-2 block">Primary genre</label>
            <div className="relative">
              <select
                value={payload.genre}
                onChange={(e) => setPayload((prev) => ({ ...prev, genre: e.target.value }))}
                className="w-full bg-transparent border-b border-[#444] text-[#999] text-sm py-2 outline-none appearance-none cursor-pointer focus:border-white transition-colors pr-6"
              >
                <option value="">Add or search for a genre</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <svg className="absolute right-1 top-3 text-[#999] pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-white text-sm font-bold">Tags</label>
              <button
                type="button"
                aria-label="Tags info"
                className="w-4 h-4 rounded-full border border-[#555] flex items-center justify-center text-[#666] text-[10px] font-bold hover:border-[#888] transition-colors"
              >
                ?
              </button>
            </div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Add styles, moods, tempo."
              className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder-[#555]"
            />
          </div>

          {/* Tracks privacy */}
          <div>
            <label className="text-white text-sm font-bold mb-3 block">Tracks privacy</label>
            <div className="flex rounded-full border border-[#333] overflow-hidden">
              {(
                [
                  { value: 'no-change', label: "Don't Change" },
                  { value: 'public', label: 'All Public' },
                  { value: 'private', label: 'All Private' },
                ] as { value: BulkPrivacyOption; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePrivacy(opt.value)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                    payload.privacy === opt.value
                      ? 'bg-white text-black'
                      : 'text-[#999] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced settings */}
          <div className="border-t border-[#2a2a2a]">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen((p) => !p)}
              className="w-full flex items-center justify-between py-4 text-left hover:opacity-80 transition-opacity"
            >
              <span className="text-white text-base font-bold">Advanced settings</span>
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                className={`transition-transform duration-200 shrink-0 ${isAdvancedOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isAdvancedOpen && (
              <div className="pb-6 flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Buy link"
                  className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder-[#555]"
                />
                <input
                  type="text"
                  placeholder="Record label"
                  className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder-[#555]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[#2a2a2a]">
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={!isDirty}
            className="w-full py-3 rounded-full text-sm font-bold transition-colors duration-150 disabled:cursor-not-allowed bg-white text-black hover:bg-[#e0e0e0] disabled:bg-[#2a2a2a] disabled:text-[#555]"
          >
            Apply changes
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {isConfirmOpen && (
        <StudioApplyChangesModal
          isApplying={isApplying}
          onConfirm={handleApplyConfirm}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}

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
