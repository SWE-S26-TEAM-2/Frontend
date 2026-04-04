'use client';

import { useState } from 'react';

export default function UploadRecordBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-md bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#222] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <div className="flex items-center gap-3">
          {/* Mic icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
            aria-hidden="true"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>

          <div className="text-left">
            <p className="text-white font-semibold text-sm">Or record with a microphone</p>
            <p className="text-[#999] text-xs mt-0.5">
              Upload recorded voice memos, updates, news, or intros to new releases.
            </p>
          </div>
        </div>

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-white transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-[#2a2a2a]">
          <p className="text-[#999] text-sm mt-4 mb-4">
            Recording from microphone is not yet available. Use the dropzone above to upload audio files.
          </p>
        </div>
      )}
    </div>
  );
}
