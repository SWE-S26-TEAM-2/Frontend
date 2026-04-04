'use client';

// src/components/Upload/UploadSuccess.tsx
import { useRouter } from 'next/navigation';

interface IUploadSuccessProps {
  trackId: string;
  onClose: () => void;
}

const FOOTER_LINKS = [
  'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager',
  'Imprint', 'About us', 'Copyright', 'Feedback',
];

const STREAMING_SERVICES = [
  {
    label: 'SoundCloud',
    solid: true,
    large: true,
    icon: (
      <svg viewBox="-2 0 32 32" width="58" height="58" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M23.2 22.68h-10.12c-0.28 0-0.56-0.16-0.72-0.4-0.08-0.12-0.12-0.32-0.12-0.48v-10.76c0-0.28 0.16-0.56 0.4-0.72 1.04-0.64 2.28-1 3.52-1 2.92 0 5.48 1.88 6.36 4.64 0.24-0.04 0.48-0.08 0.72-0.08 2.4 0 4.4 1.96 4.4 4.4s-2.04 4.4-4.44 4.4zM10.84 21.8v-8.68c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v8.72c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM7.8 21.8v-9c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v9.04c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM4.76 21.8v-6.48c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v6.52c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM1.72 21.32v-5.32c0-0.48-0.4-0.84-0.84-0.84s-0.88 0.36-0.88 0.84v5.32c0 0.48 0.4 0.84 0.84 0.84s0.88-0.36 0.88-0.84z" />
      </svg>
    ),
  },
  {
    label: 'Spotify',
    solid: false,
    large: false,
    icon: (
      <svg width="50" height="50" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    label: 'Apple Music',
    solid: false,
    large: false,
    icon: (
      <svg width="50" height="50" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    solid: false,
    large: false,
    icon: (
      <svg width="50" height="50" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    solid: false,
    large: false,
    icon: (
      <svg width="50" height="50" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    solid: false,
    large: false,
    icon: (
      <svg width="50" height="50" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
  {
    label: 'Deezer',
    solid: false,
    large: false,
    icon: (
      <svg width="50" height="50" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M18.81 11.647H24v2.243h-5.19zM18.81 14.713H24v2.242h-5.19zM18.81 8.58H24v2.242h-5.19zM12.617 14.713h5.19v2.242h-5.19zM12.617 11.647h5.19v2.243h-5.19zM6.425 14.713h5.19v2.242h-5.19zM0 14.713h5.424v2.242H0z" />
      </svg>
    ),
  },
  {
    label: 'Melon',
    solid: false,
    large: false,
    icon: (
      <span className="text-white font-bold text-4xl">M</span>
    ),
  },
  {
    label: 'Facebook',
    solid: false,
    large: false,
    icon: (
      <svg width="50" height="50" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  // {
  //   label: 'Beatport',
  //   solid: false,
  //   large: false,
  //   icon: (
  //     <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
  //       <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c2.016 0 3.576 1.608 3.576 3.6S14.016 11.7 12 11.7H8.4V4.5H12zm0 15c-2.016 0-3.576-1.608-3.576-3.6S9.984 12.3 12 12.3h3.6v7.2H12z" />
  //     </svg>
  //   ),
  // },
  // {
  //   label: 'Amazon Music',
  //   solid: false,
  //   large: false,
  //   icon: (
  //     <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
  //       <path d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705a.66.66 0 0 1-.75.074c-1.052-.873-1.24-1.276-1.814-2.106-1.734 1.767-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.095V6.41c0-.677.051-1.475-.342-2.059-.342-.522-.997-.737-1.573-.737-1.067 0-2.021.548-2.255 1.686-.048.254-.233.504-.49.517l-2.741-.298c-.23-.051-.487-.238-.42-.591C7.053 2.219 9.561 1.5 11.797 1.5c1.141 0 2.633.304 3.534 1.168 1.141 1.066.103 2.488 1.03 4.125v5.588c0 1.68.697 2.418 1.35 3.324.233.325.284.714-.015.958-.757.631-2.107 1.802-2.852 2.459l-.7-.327z" />
  //     </svg>
  //   ),
  // },
  {
    label: 'Many more',
    solid: false,
    large: false,
    icon: (
      <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
];

export default function UploadSuccess({ trackId, onClose }: IUploadSuccessProps) {
  const router = useRouter();

  const handleViewTrack = () => {
    router.push(`/track/${trackId}`);
  };

  return (
    // FIX 1: Fixed height screen and overflow-hidden ensures the base page doesn't scroll
    <div className="h-screen bg-[#121212] text-white flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-4 shrink-0">
        {/* <svg width="33" height="20" viewBox="0 0 33 20" fill="white" aria-hidden="true">
          <rect x="0"  y="11" width="3" height="9"  rx="1.5" />
          <rect x="5"  y="7"  width="3" height="13" rx="1.5" />
          <rect x="10" y="3"  width="3" height="17" rx="1.5" />
          <rect x="15" y="0"  width="3" height="20" rx="1.5" />
          <rect x="20" y="4"  width="3" height="16" rx="1.5" />
          <rect x="25" y="8"  width="3" height="12" rx="1.5" />
          <rect x="30" y="12" width="3" height="8"  rx="1.5" />
        </svg> */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full border border-[#444] flex items-center justify-center hover:border-white transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="1" y1="1" x2="11" y2="11" />
            <line x1="11" y1="1" x2="1" y2="11" />
          </svg>
        </button>
      </header>

      {/* ── Main ── */}
      {/* FIX 2: We use h-full to fill the remaining screen space */}
      <main className="flex-1 flex overflow-hidden">
        <div className="max-w-4xl w-full mx-auto px-6 py-12 flex gap-16 h-full">

          {/* LEFT: vertical chain of circles */}
          {/* FIX 3: overflow-y-auto only on this column + h-full */}
          <div className="flex flex-col items-center shrink-0 pt-4 h-full overflow-y-auto no-scrollbar scroll-smooth pb-20">
            {STREAMING_SERVICES.map((service, idx) => (
              <div key={service.label} className="flex flex-col items-center">
                {idx > 0 && (
                  <div className="w-px h-8 border-l-2 border-dashed border-[#444]" aria-hidden="true" />
                )}
                <div
                  className={`
                    rounded-full flex flex-col items-center justify-center gap-0.5 shrink-0
                    ${service.solid
                    ? 'w-30 h-30 border-4 border-white'
                    : 'w-30 h-30 border-2 border-dashed border-[#444]'
                    }
                  `}
                >
                  {service.icon}
                  {service.label === 'Many more' && (
                    <span className="text-white text-[11px] font-semibold">Many more</span>
                  )}
                </div>
              </div>
            ))}
            {/* Added extra dashed lines at the end to match the UI visual of a continuous chain */}
            <div className="w-px h-16 border-l-2 border-dashed border-[#444]" aria-hidden="true" />
          </div>

          {/* RIGHT: content */}
          {/* FIX 4: No overflow classes here keeps it fixed */}
          <div className="flex flex-col gap-14 pt-4 flex-1">

            {/* Success section */}
            <div>
              <h1 className="text-4xl font-bold mb-3">Saved to SoundCloud.</h1>
              <p className="text-[#ccc] text-[15px] mb-6">
                Congratulations! Your tracks are now on SoundCloud.
              </p>
              <button
                type="button"
                onClick={handleViewTrack}
                className="px-6 py-2.5 border-2 border-white text-white font-bold text-sm rounded-full hover:bg-white hover:text-black transition-colors duration-200"
              >
                View track
              </button>
            </div>

            {/* Distribute section */}
            <div>
              <h2 className="text-3xl font-bold mb-3">Distribute to more streaming services?</h2>
              <p className="text-[#ccc] text-[15px] mb-6 max-w-lg">
                Easily send your SoundCloud tracks to Spotify, Apple Music, TikTok, Instagram and more with an Artist Pro subscription.{' '}
                <a href="#" className="underline hover:text-white">Learn more</a>.
              </p>
              <button
                type="button"
                className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full hover:bg-[#e0e0e0] transition-colors duration-200"
              >
                Unlock with Artist Pro
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer links ── */}
      <footer className="py-6 px-6 shrink-0 bg-[#121212]">
        <nav aria-label="Footer links">
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {FOOTER_LINKS.map((link, idx) => (
              <li key={link} className="flex items-center gap-3">
                <a href="#" className="text-[#999] text-xs hover:text-white transition-colors duration-150">
                  {link}
                </a>
                {idx < FOOTER_LINKS.length - 1 && (
                  <span className="text-[#555] text-xs" aria-hidden="true">-</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </footer>

      {/* Added some CSS to hide scrollbar for the icon chain for a cleaner look */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}