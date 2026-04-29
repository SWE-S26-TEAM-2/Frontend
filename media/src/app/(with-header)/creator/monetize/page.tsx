'use client';

// src/app/(with-header)/creator/monetize/page.tsx

export default function MonetizePage() {
  return (
    <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)]">
      <div className="max-w-5xl mx-auto px-8 py-16 flex flex-col gap-16">

        {/* Hero section */}
        <div className="flex items-center justify-between gap-12">
          <div className="flex-1 max-w-xl">
            <h1 className="text-white text-4xl font-bold leading-tight mb-6">
              Get paid for your plays on SoundCloud
            </h1>
            <p className="text-[#ccc] text-sm leading-relaxed mb-4">
              As an Artist or Artist Pro subscriber, you can earn money from the plays your tracks
              get on SoundCloud. We call this Monetization. When you monetize your tracks you&apos;ll
              benefit from SoundCloud&apos;s revolutionary fan-powered royalties: the more fans listen
              to your music, the more you get paid.
            </p>
            <p className="text-[#ccc] text-sm leading-relaxed mb-4">
              Note: If you request to monetize a track that is already monetizing under the
              SoundCloud Premier program, SoundCloud Direct will handle monetizing the track for
              you moving forward.
            </p>
            <p className="text-[#ccc] text-sm leading-relaxed mb-8">
              Monetized tracks also support custom waveform background.
            </p>

            <button
              type="button"
              className="px-6 py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-[#e0e0e0] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Get started
            </button>
          </div>

          {/* Waveform graphic */}
          <div className="shrink-0 w-80 h-64 relative flex items-center justify-center">
            <WaveformGraphic />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#2a2a2a]" />

      </div>
    </div>
  );
}

// ── Waveform / blob graphic ────────────────────────────────────────────────────

function WaveformGraphic() {
  return (
    <svg
      viewBox="0 0 320 240"
      width="100%"
      height="100%"
      aria-label="Monetization graphic"
    >
      {/* Background blob */}
      <ellipse cx="200" cy="120" rx="110" ry="90" fill="#3d9970" opacity="0.35" />
      <ellipse cx="220" cy="130" rx="80" ry="65" fill="#3d9970" opacity="0.5" />

      {/* Dotted grid pattern */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 14 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 22 + 10}
            cy={row * 22 + 10}
            r="1.5"
            fill="#3d9970"
            opacity="0.4"
          />
        ))
      )}

      {/* Headphone-like shape (stylized) */}
      <g transform="translate(160, 110)">
        {/* Body */}
        <path
          d="M-50,-20 Q-50,-70 0,-70 Q50,-70 50,-20 L50,10 Q50,30 30,30 L20,30 Q0,30 0,10 L0,-20 Q0,-40 -20,-40 Q-40,-40 -40,-20 L-40,10 Q-40,30 -20,30 L-10,30"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left ear cup */}
        <rect x="-60" y="-5" width="20" height="36" rx="8" fill="white" />
        {/* Right ear cup */}
        <rect x="40" y="-5" width="20" height="36" rx="8" fill="white" />
        {/* Waveform lines on right cup */}
        <line x1="46" y1="5" x2="46" y2="20" stroke="#3d9970" strokeWidth="2" strokeLinecap="round" />
        <line x1="51" y1="1" x2="51" y2="24" stroke="#3d9970" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="8" x2="56" y2="17" stroke="#3d9970" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
