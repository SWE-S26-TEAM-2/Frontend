'use client';

const COMMENT_BUBBLES = [
  { text: 'Addicted 😍', position: 'right-8 top-0' },
  { text: 'I need a 10hr version', position: 'right-32 top-16' },
  { text: 'nah this is sick 🔥', position: 'right-16 top-32' },
];

export default function StudioCommentsTab() {
  return (
    <div className="flex flex-col gap-0 text-white">

      {/* Hero section */}
      <div className="flex items-start justify-between gap-8 py-10">
        <div className="flex-1 max-w-xl">

          {/* Artist Pro badge */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-5 h-5 rounded-full bg-[#f5a623] flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="text-[#f5a623] text-xs font-bold tracking-widest uppercase">
              Artist Pro
            </span>
          </div>

          <h1 className="text-4xl font-black leading-tight mb-5">
            Every comment in one place
          </h1>

          <p className="text-[#ccc] text-sm leading-relaxed mb-8">
            With Artist Pro, you get access to Comments Hub which brings together every comment
            across all of your tracks, so you can easily see what fans are saying about you. Read,
            moderate and respond to your comments, all in one place.
          </p>

          <button
            type="button"
            className="px-7 py-3 bg-white text-black text-sm font-bold rounded-full hover:bg-[#e0e0e0] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get Artist Pro
          </button>
        </div>

        {/* Decorative comment bubbles */}
        <div
          className="shrink-0 w-80 h-48 relative hidden lg:block"
          aria-hidden="true"
        >
          {COMMENT_BUBBLES.map((bubble) => (
            <div
              key={bubble.text}
              className={`absolute ${bubble.position} bg-[#f5a0a0] text-black text-sm font-semibold px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg whitespace-nowrap`}
            >
              {bubble.text}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
