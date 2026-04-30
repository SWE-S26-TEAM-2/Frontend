'use client';

import { useRouter } from 'next/navigation';

// ── SVG icon components ───────────────────────────────────────────────────────

const IconGrowAudience = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconInsights = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IconUnlimitedUploads = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const IconDistribution = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const IconUpload = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const IconBoost = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconDistribute = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const IconReplace = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const IconMastering = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/>
    <line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/>
    <line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/>
    <line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

const IconAudienceStats = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconCommunity = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// ── Plan feature rows data ─────────────────────────────────────────────────────

const artistFeatures = [
  { icon: <IconUpload className="w-4 h-4" />, text: '3 hours of uploads', badge: null, badgeColor: '' },
  { icon: <IconBoost className="w-4 h-4" />, text: 'Boost tracks and get 100+ listeners', badge: '2X MONTH', badgeColor: 'text-[#5500ff] bg-purple-50' },
  { icon: <IconDistribute className="w-4 h-4" />, text: 'Distribute & monetize tracks', badge: '2X MONTH', badgeColor: 'text-[#5500ff] bg-purple-50' },
  { icon: <IconReplace className="w-4 h-4" />, text: 'Replace tracks without losing stats', badge: '3X MONTH', badgeColor: 'text-[#5500ff] bg-purple-50' },
  { icon: <IconMastering className="w-4 h-4" />, text: 'AI Mastering', badge: '1X MONTH', badgeColor: 'text-[#5500ff] bg-purple-50' },
];

const proFeatures = [
  { icon: <IconUnlimitedUploads className="w-4 h-4" />, text: 'Unlimited uploads', badge: null, badgeColor: '' },
  { icon: <IconBoost className="w-4 h-4" />, text: 'Boost tracks and get 100+ listeners', badge: 'UNLIMITED', badgeColor: 'text-[#c9a84c] bg-amber-50' },
  { icon: <IconDistribute className="w-4 h-4" />, text: 'Distribute & monetize tracks', badge: 'UNLIMITED', badgeColor: 'text-[#c9a84c] bg-amber-50' },
  { icon: <IconReplace className="w-4 h-4" />, text: 'Replace tracks without losing stats', badge: 'UNLIMITED', badgeColor: 'text-[#c9a84c] bg-amber-50' },
  { icon: <IconMastering className="w-4 h-4" />, text: 'AI Mastering', badge: '3X MONTH', badgeColor: 'text-[#c9a84c] bg-amber-50' },
];

const proExtras = [
  { icon: <IconAudienceStats className="w-4 h-4" />, text: 'Audience stats and insights' },
  { icon: <IconCommunity className="w-4 h-4" />, text: 'Community management tools' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ArtistProPage() {
  const router = useRouter();

  return (
    <div className="w-full font-sans">

      {/* ── SECTION 1: Dark Hero ── */}
      <div
        className="relative text-white overflow-hidden min-h-screen flex flex-col justify-between px-16 pt-24 pb-0"
        style={{
          backgroundColor: '#111',
          backgroundImage: 'url(https://checkout.sndcdn.com/checkout-hero-images/hero-background-image-speakers.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        {/* Left: Headline + buttons */}
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-8xl font-black leading-none tracking-tight mb-6">
            Reach more listeners.
          </h1>
          <p className="text-lg font-semibold mb-10 flex items-center gap-3">
            <span className="flex -space-x-2">
              <span className="inline-block w-8 h-8 rounded-full bg-gray-500 border-2 border-[#111]" />
              <span className="inline-block w-8 h-8 rounded-full bg-gray-400 border-2 border-[#111]" />
              <span className="inline-block w-8 h-8 rounded-full bg-gray-600 border-2 border-[#111]" />
            </span>
            Join millions of artists that use SoundCloud to get heard.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full bg-white text-black px-7 py-3 text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Get Artist Pro
            </button>
            <button
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-white text-white px-7 py-3 text-sm font-semibold hover:bg-white hover:text-black transition-colors"
            >
              See all plans
            </button>
          </div>
        </div>

        {/* Bottom: 4 feature columns */}
        <div className="relative z-10 grid grid-cols-4 gap-8 mt-24 pb-16 border-t border-white/10 pt-10">
          <div>
            <IconGrowAudience className="w-8 h-8 mb-3 text-white" />
            <h3 className="font-bold text-base mb-2">Grow your audience</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Artist Pro subscribers get on average 400% more listens, thanks to our audio algorithm and featured playlists.
            </p>
          </div>
          <div>
            <IconInsights className="w-8 h-8 mb-3 text-white" />
            <h3 className="font-bold text-base mb-2">Know your audience</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get advanced fan insights and custom listening reports to build connections and plan promotions, releases, and tours.
            </p>
          </div>
          <div>
            <IconUnlimitedUploads className="w-8 h-8 mb-3 text-white" />
            <h3 className="font-bold text-base mb-2">Upload unlimited tracks</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Upload and replace unlimited tracks without losing your plays, likes, and comments.
            </p>
          </div>
          <div>
            <IconDistribution className="w-8 h-8 mb-3 text-white" />
            <h3 className="font-bold text-base mb-2">Distribution is included</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Distribute and get paid on SoundCloud and 60+ platforms including Spotify, Apple Music, and TikTok.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 2 & 3: White Plans Section ── */}
      <div id="plans-section" className="bg-white text-black px-16 py-24">
        <h2 className="text-6xl font-black text-center mb-20">Available plans.</h2>

        <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">

          {/* Artist plan */}
          <div className="rounded-2xl border border-gray-200 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-black">Artist</span>
              <span className="text-xl text-[#5500ff]">⊕</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Tailored access to essential artist tools</p>
            <p className="font-black text-2xl text-[#5500ff] mb-1">
              EGP 29.99{' '}
              <span className="text-sm font-normal text-gray-500">
                / month, billed yearly for EGP 359.88
              </span>
            </p>
            <button
              onClick={() => router.push('/subscription/checkout?plan=artist')}
              className="w-full mt-4 mb-8 rounded-full bg-black text-white py-4 text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Get started
            </button>

            <div className="flex flex-col divide-y divide-gray-100">
              {artistFeatures.map((f) => (
                <div key={f.text} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#5500ff] flex items-center">{f.icon}</span>
                    <span className="text-sm font-medium">{f.text}</span>
                  </div>
                  {f.badge && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Artist Pro plan */}
          <div className="relative rounded-2xl border-2 border-[#c9a84c] p-8 flex flex-col">
            <div className="absolute top-0 right-0 bg-[#c9a84c] text-white text-xs font-bold px-5 py-2 rounded-bl-xl rounded-tr-2xl tracking-wider">
              MOST POPULAR
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-black">Artist Pro</span>
              <span className="text-xl text-[#c9a84c]">★</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Unlimited access to all artist tools</p>
            <p className="font-black text-2xl text-[#c9a84c] mb-1">
              EGP 74.99{' '}
              <span className="text-sm font-normal text-gray-500">
                / month, billed yearly for EGP 899.88
              </span>
            </p>
            <button
              onClick={() => router.push('/subscription/checkout?plan=artist-pro')}
              className="w-full mt-4 mb-8 rounded-full bg-black text-white py-4 text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              Get started
            </button>

            <div className="flex flex-col divide-y divide-gray-100">
              {proFeatures.map((f) => (
                <div key={f.text} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#c9a84c] flex items-center">{f.icon}</span>
                    <span className="text-sm font-medium">{f.text}</span>
                  </div>
                  {f.badge && (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-semibold tracking-widest">AND MORE</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {proExtras.map((f) => (
                <div key={f.text} className="flex items-center gap-3 py-4">
                  <span className="text-[#c9a84c] flex items-center">{f.icon}</span>
                  <span className="text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 4: Compare features ── */}
      <div className="bg-white text-black pb-24">
        <h2 className="text-6xl font-black text-center py-16">Compare features.</h2>

        {/* Sticky plan header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-8 py-6">
          <div className="grid grid-cols-4 max-w-5xl mx-auto">
            <div />
            {/* Basic */}
            <div className="text-center">
              <p className="text-2xl font-black">Basic</p>
              <p className="text-sm text-gray-500 mb-3">Free</p>
              <button className="rounded-full border border-gray-300 px-6 py-2 text-sm text-gray-500 cursor-default">
                Current plan
              </button>
            </div>
            {/* Artist */}
            <div className="text-center">
              <p className="text-2xl font-black">Artist</p>
              <p className="text-sm text-gray-500 mb-1">
                EGP 29.99{' '}
                <span className="text-xs">/month, billed yearly for EGP 359.88</span>
              </p>
              <button
                onClick={() => router.push('/subscription/checkout?plan=artist')}
                className="rounded-full bg-black text-white px-6 py-2 text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Get started
              </button>
            </div>
            {/* Artist Pro */}
            <div className="text-center">
              <p className="text-2xl font-black">Artist Pro</p>
              <p className="text-sm mb-1">
                <span className="text-[#1a8a4a] font-black">EGP 74.99</span>{' '}
                <span className="text-xs text-gray-500">/month, billed yearly for EGP 899.88</span>
              </p>
              <button
                onClick={() => router.push('/subscription/checkout?plan=artist-pro')}
                className="rounded-full bg-black text-white px-6 py-2 text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Get started
              </button>
            </div>
          </div>
        </div>

        {/* Feature rows */}
        <div className="max-w-5xl mx-auto px-8">
          {[
            {
              title: 'Get heard',
              rows: [
                { name: 'Promote tracks', desc: 'Our algorithm analyzes and recommends your tracks to 100 or even 1000 listeners most likely to love it.', basic: null, artist: '2 tracks / month', pro: 'Unlimited' },
                { name: 'Get playlisted', desc: 'Subscribers that opt in can get featured on playlists like Buzzing followed by future fans, A&Rs, and more', basic: null, artist: '2 tracks / month', pro: 'Unlimited' },
                { name: 'Distribute and get paid', desc: 'Earn royalties from 60+ social and streaming platforms like Spotify and TikTok', basic: null, artist: '2 tracks / month', pro: 'Unlimited' },
                { name: 'Advanced audience stats', desc: "See how listeners found your music, your top fans, and where they're located", basic: null, artist: 'How fans found you', pro: 'Unlimited' },
                { name: 'Comments hub', desc: 'Effectively track and answer messages and comments', basic: null, artist: null, pro: 'available' },
              ],
            },
            {
              title: 'Manage your music',
              rows: [
                { name: 'Upload limit', desc: '', basic: '2 hours', artist: '3 hours', pro: 'Unlimited' },
                { name: 'Free mastering credits', desc: '', basic: null, artist: '1 track / month', pro: '3 tracks / month' },
                { name: 'Replace tracks', desc: 'Swap out your track files without losing plays, likes or comments.', basic: null, artist: '3 tracks / month', pro: 'Unlimited' },
                { name: 'Quiet mode', desc: 'Hide or turn off comments for tracks, and choose if you want to have plays and likes displayed.', basic: null, artist: null, pro: 'available' },
                { name: 'Schedule track releases', desc: '', basic: null, artist: null, pro: 'available' },
              ],
            },
            {
              title: 'Build your brand',
              rows: [
                { name: 'Profile badge', desc: 'Visible to fans and collaborators.', basic: null, artist: 'artist-badge', pro: 'pro-badge' },
                { name: 'Spotlight', desc: 'Have control over your first impression by spotlighting your best tracks at the top of your profile.', basic: null, artist: '1 track', pro: '5 tracks' },
              ],
            },
            {
              title: 'Get paid',
              rows: [
                { name: 'Monetize on SoundCloud', desc: 'Get paid for streams on SoundCloud with fan-powered royalties, and keep 100% of your earnings.', basic: null, artist: '2 tracks / month', pro: 'Unlimited' },
                { name: 'Distribute and monetize on 60+ other platforms', desc: 'Get paid regularly for streams on Spotify, Apple Music, TikTok and more, and keep 100% of your earnings.', basic: null, artist: '2 tracks / month', pro: 'Unlimited' },
                { name: 'YouTube Content ID', desc: 'Get paid when your music is used in YouTube videos', basic: null, artist: 'available', pro: 'available' },
                { name: 'Split royalties', desc: 'Make sure your collaborators get paid', basic: null, artist: null, pro: 'available' },
              ],
            },
            {
              title: 'Special treatment',
              rows: [
                { name: 'Priority support', desc: '', basic: null, artist: null, pro: 'available' },
                { name: 'Get 50% off Go+', desc: '', basic: null, artist: null, pro: 'available' },
                { name: 'Exclusive Partner Savings', desc: 'Exclusive offers & discounts from partners like Groover, Serato, and Tracklib.', basic: null, artist: 'Partial access', pro: 'Full access' },
              ],
            },
          ].map((section) => (
            <div key={section.title} className="mt-12">
              <h3 className="text-xl font-bold mb-6">{section.title}</h3>
              <div className="border-t border-gray-200">
                {section.rows.map((row) => (
                  <div key={row.name} className="grid grid-cols-4 border-b border-gray-100 py-5 items-center">
                    <div>
                      <p className="text-sm font-semibold">{row.name}</p>
                      {row.desc && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{row.desc}</p>}
                    </div>

                    {/* Basic */}
                    <div className="text-center">
                      {row.basic === null ? (
                        <span className="text-gray-300 text-lg">—</span>
                      ) : (
                        <span className="text-gray-700 text-sm">{row.basic}</span>
                      )}
                    </div>

                    {/* Artist */}
                    <div className="text-center">
                      {row.artist === null ? (
                        <span className="text-gray-300 text-lg">—</span>
                      ) : row.artist === 'available' ? (
                        <span className="text-[#1a8a4a] text-sm font-medium flex items-center justify-center gap-1">
                          Available
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a8a4a] text-white text-xs">
                            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3"/>
                            </svg>
                          </span>
                        </span>
                      ) : row.artist === 'artist-badge' ? (
                        <span className="flex items-center justify-center gap-1 text-sm font-semibold text-[#5500ff]">
                          <span className="w-5 h-5 rounded-full bg-[#5500ff] text-white flex items-center justify-center text-xs">+</span>
                          ARTIST
                        </span>
                      ) : (
                        <span className="text-gray-700 text-sm">{row.artist}</span>
                      )}
                    </div>

                    {/* Artist Pro */}
                    <div className="text-center">
                      {row.pro === null ? (
                        <span className="text-gray-300 text-lg">—</span>
                      ) : row.pro === 'available' ? (
                        <span className="text-[#1a8a4a] text-sm font-medium flex items-center justify-center gap-1">
                          Available
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a8a4a] text-white text-xs">
                            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2 6 5 9 10 3"/>
                            </svg>
                          </span>
                        </span>
                      ) : row.pro === 'pro-badge' ? (
                        <span className="flex items-center justify-center gap-1 text-sm font-semibold text-[#c9a84c]">
                          <span className="w-5 h-5 rounded-full bg-[#c9a84c] text-white flex items-center justify-center text-xs">★</span>
                          ARTIST PRO
                        </span>
                      ) : row.pro === 'Full access' ? (
                        <span className="text-[#1a8a4a] text-sm font-semibold">Full access</span>
                      ) : (
                        <span className="text-[#1a8a4a] text-sm font-medium">{row.pro}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto px-8 mt-20 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Signed in as Irinie.{' '}
            <a href="#" className="text-blue-500 hover:underline">Sign out</a>
          </p>
          <div className="flex gap-3 mt-3 text-sm text-blue-500 flex-wrap">
            {['Legal', 'Privacy', 'Cookies', 'Consent Manager', 'Imprint', 'Help Center'].map((l, i, arr) => (
              <span key={l} className="flex items-center gap-3">
                <a href="#" className="hover:underline">{l}</a>
                {i < arr.length - 1 && <span className="text-gray-300">-</span>}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            Language:
            <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700">
              <option>English (US)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}