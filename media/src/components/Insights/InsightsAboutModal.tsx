'use client';

// src/components/Insights/InsightsAboutModal.tsx

import type { IInsightsAboutModal } from '@/types/insights.types';

const MIGRATE_URL =
  'https://help.soundcloud.com/hc/en-us/articles/115003570867-Migrating-your-catalog-to-SoundCloud-for-Artists';

export default function InsightsAboutModal({ onClose }: IInsightsAboutModal) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-[#1a1a1a] rounded-xl w-full max-w-2xl mx-4 p-10 shadow-2xl flex gap-8 items-start">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition-colors text-white"
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-white text-2xl font-bold mb-5">All Platform Insights</h2>

          <p className="text-[#ccc] text-sm leading-relaxed mb-4">
            Your All Platforms Insights only shows Spotify and Apple Music data for tracks
            you&apos;ve released using{' '}
            <span className="text-white font-bold">SoundCloud Distribution</span>.
          </p>

          <p className="text-[#ccc] text-sm leading-relaxed mb-4">
            If you&apos;ve distributed songs through other services, those streams won&apos;t
            appear here—so your totals may differ from what you see on other platforms. If you
            want to migrate previously released tracks to SoundCloud, simply{' '}
            <a
              href={MIGRATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2 hover:text-[#ccc] transition-colors"
            >
              follow these instructions
            </a>
            .
          </p>

          <p className="text-[#ccc] text-sm leading-relaxed mb-8">
            Once a track is released through SoundCloud, its data will appear in your All
            Platforms Insights within 24–48 hours.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-full border border-white text-white text-sm font-bold hover:bg-white hover:text-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Close
          </button>
        </div>

        {/* Illustration placeholder — purple device graphic */}
        <div className="shrink-0 w-52 hidden md:flex items-center justify-center" aria-hidden="true">
          <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
            {/* Device body */}
            <rect x="30" y="20" width="100" height="100" rx="16" fill="#3a0fa0" />
            <rect x="38" y="28" width="84" height="64" rx="8" fill="#1a0060" />
            {/* Waveform dots */}
            {[0,1,2,3,4,5,6].map((i) => (
              <rect
                key={i}
                x={50 + i * 10}
                y={52 - (i % 3) * 6}
                width="6"
                height={8 + (i % 3) * 6}
                rx="3"
                fill="#a855f7"
                opacity="0.9"
              />
            ))}
            {/* Play button */}
            <circle cx="80" cy="108" r="16" fill="#6d28d9" />
            <polygon points="75,101 75,115 90,108" fill="white" />
            {/* Cable squiggle */}
            <path
              d="M80 120 Q90 135 110 130 Q130 125 125 145 Q120 155 140 152"
              stroke="#d946ef"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Headphone jack */}
            <circle cx="140" cy="152" r="4" fill="#a855f7" />
            {/* Top ribbon */}
            <path
              d="M100 25 Q130 5 145 20 Q155 35 135 45"
              stroke="#ec4899"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
