'use client';

// src/app/(with-header)/creator/distribute/page.tsx

export default function DistributePage() {
  return (
    <div className="bg-[#121212] text-white min-h-[calc(100vh-48px-56px)]">
      <div className="max-w-5xl mx-auto px-8 py-16 flex flex-col gap-16">

        {/* Hero section */}
        <div className="flex items-start justify-between gap-12">
          <div className="flex-1 max-w-xl">
            <h1 className="text-white text-4xl font-bold leading-tight mb-6">
              Distribute your music to Spotify, Apple Music, TikTok and more.
            </h1>
            <p className="text-[#ccc] text-sm leading-relaxed mb-3">
              It&apos;s true — SoundCloud is the only streaming platform that also helps amplify the
              reach of your albums, EPs, and singles as a distributor to 30+ major streaming
              platforms and social networks around the world.
            </p>
            <p className="text-white text-sm font-semibold mb-8">
              Distribution is available to Artist or Artist Pro subscribers only.
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="px-6 py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-[#e0e0e0] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Get started
              </button>
              <button
                type="button"
                className="px-6 py-3 border border-white text-white text-sm font-bold rounded-full hover:bg-white hover:text-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Distribution FAQs
              </button>
            </div>
          </div>

          {/* Globe graphic */}
          <div className="shrink-0 w-72 h-72 relative flex items-center justify-center">
            <GlobeGraphic />
          </div>
        </div>

        {/* Distribution section */}
        <div>
          <h2 className="text-white text-2xl font-bold mb-6">Distribution</h2>

          <div className="border border-[#2a2a2a] rounded-lg p-8 flex items-start gap-6 bg-[#181818]">
            {/* Icon */}
            <div className="shrink-0 w-14 h-14 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="4" y="28" width="8" height="16" rx="1" fill="white" />
                <rect x="20" y="18" width="8" height="26" rx="1" fill="white" />
                <rect x="36" y="8" width="8" height="36" rx="1" fill="white" />
                <line x1="4" y1="36" x2="20" y2="28" stroke="white" strokeWidth="2" />
                <line x1="20" y1="28" x2="36" y2="18" stroke="white" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-white text-lg font-bold mb-3">
                Everything you need to manage your releases
              </h3>
              <p className="text-[#ccc] text-sm leading-relaxed mb-6">
                SoundCloud makes it easy to distribute your music. We&apos;ll walk you through each
                step of the process and are here to provide support as needed to help.
                Distribution is available to Artist or Artist Pro subscribers only.
              </p>
              <button
                type="button"
                className="px-6 py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-[#e0e0e0] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Get started
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Globe SVG graphic ──────────────────────────────────────────────────────────

function GlobeGraphic() {
  const platforms = [
    { label: 'Spotify',   x: -110, y: -80  },
    { label: 'Amazon',    x:  110, y: -90  },
    { label: 'TikTok',   x: -130, y:  20  },
    { label: 'Apple',    x:  130, y:  20  },
    { label: 'YouTube',  x: -110, y:  110 },
    { label: 'Twitch',   x:  110, y:  110 },
    { label: 'Diamond',  x:    0, y:  140 },
  ];

  return (
    <svg
      viewBox="-160 -160 320 330"
      width="100%"
      height="100%"
      aria-label="Distribution network graphic"
    >
      {/* Globe circle */}
      <circle cx="0" cy="0" r="72" fill="none" stroke="white" strokeWidth="1.5" />

      {/* Latitude lines */}
      {[-40, 0, 40].map((cy) => (
        <ellipse key={cy} cx="0" cy={cy} rx="72" ry={Math.abs(cy) === 40 ? 30 : 72} fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
      ))}

      {/* Longitude lines */}
      {[-50, 0, 50].map((angle) => (
        <ellipse key={angle} cx="0" cy="0" rx={Math.abs(angle) === 50 ? 35 : 72} ry="72" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" transform={`rotate(${angle})`} />
      ))}

      {/* SoundCloud logo center */}
      <circle cx="0" cy="0" r="22" fill="white" />
      <text x="0" y="5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="black">SC</text>

      {/* Lines to platform dots + dots */}
      {platforms.map((p) => {
        const angle = Math.atan2(p.y, p.x);
        const edgeX = Math.cos(angle) * 72;
        const edgeY = Math.sin(angle) * 72;
        return (
          <g key={p.label}>
            <line x1={edgeX} y1={edgeY} x2={p.x} y2={p.y} stroke="white" strokeWidth="1" strokeOpacity="0.6" />
            <circle cx={p.x} cy={p.y} r="10" fill="white" />
          </g>
        );
      })}
    </svg>
  );
}
