'use client';

// src/components/Insights/InsightsTopTracksCard.tsx

import Image from 'next/image';
import type { IInsightsTopTracksCard } from '@/types/insights.types';

export default function InsightsTopTracksCard({ tracks, timeRangeLabel }: IInsightsTopTracksCard) {
  return (
    <div className="flex flex-col rounded-lg border border-[#2a2a2a] bg-[#181818] overflow-hidden">
      {/* Card body */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white text-lg font-bold">Top tracks</h2>
          <button
            type="button"
            className="text-[#999] text-sm hover:text-white transition-colors font-semibold"
          >
            See all
          </button>
        </div>

        <p className="text-[#999] text-sm mb-5">{timeRangeLabel}</p>

        {tracks.length === 0 ? (
          <p className="text-[#555] text-sm">No track data for this period.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center gap-4">
                {/* Artwork */}
                <div className="shrink-0 w-12 h-12 rounded-sm bg-[#2a2a2a] overflow-hidden relative">
                  {track.artworkUrl ? (
                    <Image
                      src={track.artworkUrl}
                      alt={track.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#555"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{track.title}</p>
                  <div className="flex items-center gap-1 text-[#999] text-xs mt-0.5">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    <span>{track.plays} plays</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a2a] bg-[#141414]">
        <p className="text-[#ccc] text-sm">
          <span className="font-bold">Pro Tip:</span> Edit your Spotlight tracks, which can help get some of your other tracks more listening time.
        </p>
        <button
          type="button"
          className="ml-4 shrink-0 px-5 py-2.5 rounded-full border border-white text-white text-sm font-bold hover:bg-white hover:text-black transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Edit your Spotlight
        </button>
      </div>
    </div>
  );
}
