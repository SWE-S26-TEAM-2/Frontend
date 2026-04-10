'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Toggle from '@/components/Toggle/Toggle';
import type { ITrackMetadata, IUploadFile, TrackVisibility, ITrackInfoFormProps } from '@/types/upload.types';
import { useAuthStore } from '@/store/authStore';

const GENRES = [
  'Alternative Rock', 'Ambient', 'Classical', 'Country', 'Dance & EDM',
  'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Electronic',
  'Hip-hop & Rap', 'House', 'Indie', 'Jazz & Blues', 'Latin', 'Metal',
  'Piano', 'Pop', 'R&B & Soul', 'Reggae', 'Reggaeton', 'Rock', 'Soundtrack',
  'Techno', 'Trance', 'Trap', 'Triphop', 'World',
];


function generateTrackLink(username: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
  return `https://soundcloud.com/${username}/${slug}`;
}

export default function TrackInfoForm({
  uploadFile,
  onReplaceTrack,
  onClose,
  onUpload,
  isUploading,
  uploadProgress,
}: ITrackInfoFormProps) {
  const { user } = useAuthStore();
  const artworkInputRef = useRef<HTMLInputElement>(null);

  const [metadata, setMetadata] = useState<ITrackMetadata>({
    title: uploadFile.name.replace(/\.[^/.]+$/, ''),
    trackLink: generateTrackLink(user?.username ?? 'user', uploadFile.name.replace(/\.[^/.]+$/, '')),
    mainArtist: user?.username ?? '',
    genre: '',
    tags: '',
    description: '',
    visibility: 'public',
    artwork: null,
  });

  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkZoom, setArtworkZoom] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isAudioClipOpen, setIsAudioClipOpen] = useState(false);
  const [isLicensingOpen, setIsLicensingOpen] = useState(false);
  const [error, setError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleChange = (field: keyof ITrackMetadata, value: string | TrackVisibility | File | null) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
      // regenerate track link when title changes
      ...(field === 'title' && typeof value === 'string'
        ? { trackLink: generateTrackLink(user?.username ?? 'user', value) }
        : {}),
    }));
  };

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleChange('artwork', file);
    setArtworkPreview(URL.createObjectURL(file));
    setArtworkZoom(1);
  };

  const handleArtworkDelete = () => {
    handleChange('artwork', null);
    setArtworkPreview(null);
    setArtworkZoom(1);
    if (artworkInputRef.current) artworkInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!metadata.title.trim()) {
      setError('Track title is required.');
      return;
    }
    setError('');
    console.log('[TrackInfoForm] submitting metadata:', metadata); // check
    onUpload(metadata);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a] shrink-0">
        <div className="flex items-center gap-3">
          <svg width="33" height="20" viewBox="0 0 33 20" fill="white" aria-hidden="true">
            <rect x="0"  y="11" width="3" height="9"  rx="1.5" />
            <rect x="5"  y="7"  width="3" height="13" rx="1.5" />
            <rect x="10" y="3"  width="3" height="17" rx="1.5" />
            <rect x="15" y="0"  width="3" height="20" rx="1.5" />
            <rect x="20" y="4"  width="3" height="16" rx="1.5" />
            <rect x="25" y="8"  width="3" height="12" rx="1.5" />
            <rect x="30" y="12" width="3" height="8"  rx="1.5" />
          </svg>
          <span className="text-white font-semibold text-lg">Track Info</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Filename */}
          <div className="flex items-center gap-2 text-[#999] text-sm max-w-[300px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            <span className="truncate">{uploadFile.name}</span>
          </div>

          {/* Replace track */}
          <button
            type="button"
            onClick={onReplaceTrack}
            className="text-white font-semibold text-sm hover:text-[#ccc] transition-colors"
          >
            Replace track
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            aria-label="Close"
            className="w-9 h-9 rounded-full border border-[#444] flex items-center justify-center hover:border-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="1" y1="1" x2="11" y2="11" />
              <line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-[380px_1fr] gap-12">

          {/* LEFT: Artwork */}
          <div className="shrink-0">
            {artworkPreview ? (
              /* ── Artwork with controls ── */
              <div className="w-full aspect-square relative overflow-hidden rounded-sm bg-black">

                {/* Image with zoom applied */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <Image
                    src={artworkPreview}
                    alt="Artwork preview"
                    fill
                    className="object-cover transition-transform duration-150"
                    style={{ transform: `scale(${artworkZoom})` }}
                  />
                </div>

                {/* Dark overlay at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-3 px-3">

                  {/* Pencil + Trash buttons — bottom right */}
                  <div className="flex justify-end gap-2 mb-3 overflow-visible">
                    {/* Replace (pencil) */}
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={() => artworkInputRef.current?.click()}
                        aria-label="Replace artwork"
                        className="w-9 h-9 rounded-full bg-[#222]/80 flex items-center justify-center hover:bg-[#333] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Replace 
                      </span>
                    </div>

                    {/* Delete (trash) */}
                    <div className="relative group">
                      <button
                        type="button"
                        onClick={handleArtworkDelete}
                        aria-label="Remove artwork"
                        className="w-9 h-9 rounded-full bg-[#222]/80 flex items-center justify-center hover:bg-[#333] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Remove
                      </span>
                    </div>
                  </div>

                  {/* Zoom slider */}
                  <div className="flex items-center gap-2">
                    {/* Minus */}
                    <button
                      type="button"
                      aria-label="Zoom out"
                      onClick={() => setArtworkZoom((z) => Math.max(1, parseFloat((z - 0.1).toFixed(1))))}
                      className="text-white opacity-70 hover:opacity-100 transition-opacity shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>

                    <input
                      type="range"
                      min={1}
                      max={2}
                      step={0.01}
                      value={artworkZoom}
                      onChange={(e) => setArtworkZoom(parseFloat(e.target.value))}
                      className="flex-1 h-1 accent-white cursor-pointer"
                      aria-label="Artwork zoom"
                    />

                    {/* Plus */}
                    <button
                      type="button"
                      aria-label="Zoom in"
                      onClick={() => setArtworkZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(1))))}
                      className="text-white opacity-70 hover:opacity-100 transition-opacity shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              /* ── Empty artwork placeholder ── */
              <button
                type="button"
                onClick={() => artworkInputRef.current?.click()}
                className="w-full aspect-square border-2 border-dashed border-[#444] rounded-sm flex flex-col items-center justify-center hover:border-[#666] transition-colors cursor-pointer bg-transparent"
                aria-label="Upload artwork"
              >
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-white text-sm font-semibold mt-4">Add new artwork</span>
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

          {/* RIGHT: Form fields */}
          <div className="flex flex-col gap-6">

            {/* Track title */}
            <div>
              <label className="text-white text-sm font-bold mb-2 flex items-center gap-1">
                Track title
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors"
                placeholder="Track title"
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Track link */}
            <div>
              <label className="text-white text-sm font-bold mb-2 block">Track link</label>
              <p className="text-[#999] text-sm py-2 border-b border-[#2a2a2a] break-all">
                {metadata.trackLink}
              </p>
            </div>

            {/* Main Artist(s) */}
            <div>
              <label className="text-white text-sm font-bold mb-2 flex items-center gap-1">
                Main Artist(s)
              </label>
              <input
                type="text"
                value={metadata.mainArtist}
                onChange={(e) => handleChange('mainArtist', e.target.value)}
                className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors"
                placeholder="Artist name"
              />
              <p className="text-[#666] text-xs mt-1">Tip: Use commas to add multiple artist names.</p>
            </div>

            {/* Genre */}
            <div>
              <label className="text-white text-sm font-bold mb-2 block">Genre</label>
              <div className="relative">
                <select
                  value={metadata.genre}
                  onChange={(e) => handleChange('genre', e.target.value)}
                  className="w-full bg-[#1a1a1a] border-b border-[#444] text-[#999] text-sm py-2 outline-none appearance-none cursor-pointer focus:border-white transition-colors pr-8"
                >
                  <option value="">Add or search for genre</option>
                  {GENRES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <svg className="absolute right-2 top-3 text-[#999] pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-white text-sm font-bold mb-2 block">Tags</label>
              <input
                type="text"
                value={metadata.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors"
                placeholder="Add styles, moods, tempo."
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-white text-sm font-bold mb-2 block">Description</label>
              <textarea
                value={metadata.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors resize-none"
                placeholder="Tracks with descriptions tend to get more plays and engagements."
              />
            </div>

            {/* Visibility */}
            <div>
              <div className="relative">
                <select
                  value={metadata.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value as TrackVisibility)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-sm text-white text-sm py-4 px-4 outline-none appearance-none cursor-pointer focus:border-white transition-colors pr-8"
                >
                  <option value="public">Public — Anyone can access and listen to this track.</option>
                  <option value="private">Private — Only you can access this track.</option>
                </select>
                <svg className="absolute right-3 top-4 text-[#999] pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

          </div>{/* end RIGHT column */}
        </div>{/* end grid */}

        {/* ── Full-width sections ── */}
        <div className="max-w-5xl mx-auto px-6 pb-8 flex flex-col">

            {/* Schedule public release — Artist Pro stub */}
            <div className="flex items-center justify-between py-3 border-t border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#666] text-sm">Schedule public release</span>
                    <span className="text-[10px] bg-[#333] text-[#999] px-1.5 py-0.5 rounded font-bold tracking-wide">ARTIST PRO</span>
                  </div>
                  <p className="text-[#555] text-xs">Track will be made public at specific date and time.</p>
                </div>
              </div>
              <Toggle value={false} onChange={() => {}} />
            </div>

            {/* Artist Pro banner */}
            <div className="flex items-center justify-between bg-[#1a1a1a] rounded-md p-4 border border-[#2a2a2a]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#6633cc] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Recommend this track to new listeners with Artist Pro</p>
                  <p className="text-[#999] text-xs mt-0.5">
                    With Artist Pro, get this track analyzed and recommended to the right listeners.{' '}
                    <span className="font-bold">Not all tracks qualify.</span>{' '}
                    <a href="#" className="underline hover:text-white">See how it works.</a>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {/* TODO: navigate to /subscription */}}
                className="ml-4 px-4 py-2 border border-white text-white text-sm font-semibold rounded-full hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0"
              >
                Get Artist Pro
              </button>
            </div>

            {/* Advanced details */}
            <CollapsibleSection
              title="Advanced details"
              subtitle="Buy link, record label, release date, publisher..."
              isOpen={isAdvancedOpen}
              onToggle={() => setIsAdvancedOpen((p) => !p)}
            >
              <div className="flex flex-col gap-4 pt-4">
                <input type="text" placeholder="Buy link" className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors" />
                <input type="text" placeholder="Record label" className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors" />
                <input type="date" placeholder="Release date" className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors" />
                <input type="text" placeholder="Publisher" className="w-full bg-transparent border-b border-[#444] text-white text-sm py-2 outline-none focus:border-white transition-colors" />
              </div>
            </CollapsibleSection>

            {/* Permissions */}
            <CollapsibleSection
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
              title="Permissions"
              subtitle="Control the visibility of engagements on your track, direct downloads, and more."
              isOpen={isPermissionsOpen}
              onToggle={() => setIsPermissionsOpen((p) => !p)}
            >
              <p className="text-[#999] text-sm pt-4">Permissions settings coming soon.</p>
            </CollapsibleSection>

            {/* Audio clip */}
            <CollapsibleSection
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>}
              title="Audio clip"
              subtitle="Pick the 20 second clip you'd like to use as your track preview."
              isOpen={isAudioClipOpen}
              onToggle={() => setIsAudioClipOpen((p) => !p)}
            >
              <p className="text-[#999] text-sm pt-4">Audio clip selection coming soon.</p>
            </CollapsibleSection>

            {/* Licensing */}
            <CollapsibleSection
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M14.31 8l-4.62 8" /><path d="M9.69 8H15" /><path d="M8.69 16H14" /></svg>}
              title="Licensing"
              subtitle="Enable Creative Commons licenses options."
              isOpen={isLicensingOpen}
              onToggle={() => setIsLicensingOpen((p) => !p)}
            >
              <p className="text-[#999] text-sm pt-4">Licensing options coming soon.</p>
            </CollapsibleSection>

        </div>{/* end full-width sections */}
      </main>

      {/* ── Footer ── */}
      <footer className="shrink-0 px-6 py-4 border-t border-[#2a2a2a] flex items-center justify-between bg-[#121212]">
        <p className="text-[#999] text-xs">
          By uploading, you confirm that your sounds comply with our{' '}
          <a href="#" className="underline hover:text-white">Terms of Use</a>
          {' '}and you don&apos;t infringe anyone else&apos;s rights.
        </p>

        {/* Upload button with progress */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isUploading}
          className="ml-6 px-8 py-3 bg-[#1db954] text-white font-bold text-sm rounded-full hover:bg-[#1ed760] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {uploadProgress}%
            </>
          ) : (
            'Upload'
          )}
        </button>
      </footer>

      {/* ── Quit confirmation modal ── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

          {/* Modal */}
          <div className="relative bg-[#1a1a1a] rounded-lg w-full max-w-md mx-4 p-8 shadow-xl">

            {/* Close modal ✕ */}
            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              aria-label="Back to upload"
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#444] flex items-center justify-center hover:border-white transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            </button>

            <h2 className="text-white text-xl font-bold mb-3">Are you sure you want to quit?</h2>
            <p className="text-[#ccc] text-sm mb-8">Your changes will not be saved.</p>

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="text-white text-sm font-semibold hover:text-[#ccc] transition-colors"
              >
                Back to upload
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#e5383b] text-white text-sm font-bold rounded-full hover:bg-[#cc2f32] transition-colors"
              >
                Quit upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reusable collapsible section ──────────────────────────────────────────────

interface ICollapsibleSectionProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ icon, title, subtitle, isOpen, onToggle, children }: ICollapsibleSectionProps) {
  return (
    <div className="border-t border-[#2a2a2a]">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-white">{icon}</span>}
          <div>
            <p className="text-white text-sm font-bold">{title}</p>
            <p className="text-[#999] text-xs mt-0.5">{subtitle}</p>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`text-white transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div className="pb-6">{children}</div>}
    </div>
  );
}
