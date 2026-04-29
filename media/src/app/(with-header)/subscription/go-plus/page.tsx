'use client';

export default function GoPlusPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero banner */}
      <div className="relative w-full h-72 bg-[#1a1a1a] flex flex-col items-start justify-end px-16 py-10">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500" />
        <p className="text-3xl font-bold text-white max-w-xl leading-snug mb-6">
          Sorry, we&apos;re still working on launching SoundCloud Go+ in your country.
        </p>
        <button className="text-sm text-white border border-white px-6 py-2 rounded-sm hover:bg-white hover:text-black transition-colors">
          Start Listening
        </button>
      </div>

      {/* Content */}
      <div className="px-16 py-12 flex flex-col gap-12 max-w-3xl">
        {/* Hear What's Next */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-wide mb-2">
            Hear what&apos;s next, now
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-purple-600 to-orange-500 mb-4" />
          <p className="text-sm text-gray-700 leading-relaxed">
            Until we can bring you offline and ad-free listening, check out some of the most buzzed
            about tracks trending in the SoundCloud community.
          </p>
        </div>

        {/* Your Subscription Supports Artists */}
        <div>
          <h2 className="text-xl font-black uppercase tracking-wide mb-2">
            Your subscription supports artists
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-purple-600 to-orange-500 mb-4" />
          <p className="text-sm text-gray-700 leading-relaxed">
            When you listen as a Go+ subscriber, you contribute to fan-powered royalties that
            directly support and help break the next big independent artists growing their careers on
            SoundCloud.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-16 py-8 border-t border-gray-200 flex flex-col gap-3">
        <p className="text-xs text-gray-500">
          Signed in as Irinie.{' '}
          <button className="text-blue-500 hover:underline">Sign out</button>
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-blue-500">
          {['Legal', 'Privacy', 'Cookies', 'Consent Manager', 'Imprint', 'Help Center'].map(
            (item) => (
              <button key={item} className="hover:underline">
                {item}
              </button>
            )
          )}
        </div>
        <p className="text-xs text-gray-500">Language: English (US)</p>
      </div>
    </div>
  );
}