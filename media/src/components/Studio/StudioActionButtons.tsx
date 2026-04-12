'use client';

import { useRouter } from 'next/navigation';

export default function StudioActionButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3">
      {/* Upload — functional */}
      <button
        type="button"
        onClick={() => router.push('/creator/upload')}
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-sm border border-[#333]
          bg-[#1a1a1a] text-white text-sm font-semibold
          hover:border-[#555] hover:bg-[#222] transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        "
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Upload or drop tracks
      </button>

      {/* Distribute — stub */}
      <button
        type="button"
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-sm border border-[#333]
          bg-[#1a1a1a] text-white text-sm font-semibold
          hover:border-[#555] hover:bg-[#222] transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        "
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Distribute tracks
      </button>

      {/* Monetize — stub */}
      <button
        type="button"
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-sm border border-[#333]
          bg-[#1a1a1a] text-white text-sm font-semibold
          hover:border-[#555] hover:bg-[#222] transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        "
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Monetize tracks
      </button>

      {/* Master — stub */}
      <button
        type="button"
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-sm border border-[#333]
          bg-[#1a1a1a] text-white text-sm font-semibold
          hover:border-[#555] hover:bg-[#222] transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        "
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Master track audio
      </button>
    </div>
  );
}
