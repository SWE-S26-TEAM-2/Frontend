'use client';

// src/components/Insights/InsightsAllPlatformsTab.tsx

export default function InsightsAllPlatformsTab() {
  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#181818] flex items-center gap-12 px-12 py-14">
      {/* Text content */}
      <div className="flex-1 min-w-0 max-w-xl">
        <h2 className="text-white text-2xl font-bold leading-snug mb-5">
          Unlock key performance and audience insights across multiple platforms for your music
        </h2>

        <p className="text-[#ccc] text-sm leading-relaxed mb-3">
          Access audience and performance insights for your distributed tracks from Spotify,
          Apple Music, and SoundCloud all from one dashboard.
        </p>

        <p className="text-[#ccc] text-sm leading-relaxed mb-8">
          Upgrade your account, upload and distribute your track to get started.
        </p>

        <button
          type="button"
          className="px-6 py-3 rounded-sm border border-white text-white text-sm font-bold hover:bg-white hover:text-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Upgrade to Artist Pro
        </button>
      </div>

      {/* Illustration */}
      <div className="shrink-0 hidden lg:flex items-center justify-center" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          width="335"
          height="310"
          src="https://insights-ui.sndcdn.com/_next/static/media/empty-state-no-distribution.261e85d0.svg"
          className="w-[335px] h-[310px]"
        />
      </div>
    </div>
  );
}
