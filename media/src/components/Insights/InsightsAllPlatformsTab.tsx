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
      <div className="shrink-0 w-64 hidden lg:flex items-center justify-center" aria-hidden="true">
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
          {/* Device body */}
          <rect x="50" y="30" width="120" height="120" rx="20" fill="#3a0fa0" />
          <rect x="62" y="42" width="96" height="76" rx="10" fill="#1a0060" />

          {/* Grid dots — SoundCloud waveform style */}
          {[0,1,2,3,4,5,6,7].map((i) => (
            <rect
              key={i}
              x={72 + i * 11}
              y={66 - (i % 4) * 5}
              width="7"
              height={10 + (i % 4) * 5}
              rx="3.5"
              fill="#a855f7"
              opacity="0.85"
            />
          ))}

          {/* Rewind button */}
          <circle cx="85" cy="132" r="12" fill="#6d28d9" />
          <polygon points="81,127 81,137 76,132" fill="white" />
          <rect x="82" y="127" width="3" height="10" rx="1.5" fill="white" />

          {/* Play button */}
          <circle cx="110" cy="132" r="15" fill="#7c3aed" />
          <polygon points="106,125 106,139 121,132" fill="white" />

          {/* Fast-forward button */}
          <circle cx="135" cy="132" r="12" fill="#6d28d9" />
          <polygon points="139,127 139,137 144,132" fill="white" />
          <rect x="135" y="127" width="3" height="10" rx="1.5" fill="white" />

          {/* Cable curling down-right */}
          <path
            d="M110 148 Q118 165 140 160 Q162 155 158 175 Q154 192 175 188"
            stroke="#d946ef"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Jack plug */}
          <circle cx="176" cy="188" r="5" fill="#a855f7" />

          {/* Top-right ribbon curl */}
          <path
            d="M148 35 Q175 10 190 28 Q200 45 178 58"
            stroke="#ec4899"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Small accent line bottom-left */}
          <path
            d="M55 170 Q45 180 55 190"
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
