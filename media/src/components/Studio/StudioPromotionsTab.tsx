'use client';

// src/components/Studio/StudioPromotionsTab.tsx

interface IEligibilityItem {
  text: string;
}

interface IPromotionCard {
  id: string;
  logoSrc: string;
  logoAlt: string;
  title: string;
  description: string;
  eligibilityRequirements?: IEligibilityItem[];
  extraText?: string;
  buttonLabel: string;
  visitUrl: string;
}

const PROMOTION_CARDS: IPromotionCard[] = [
  {
    id: 'spotify',
    logoSrc:
      'https://assets.web.soundcloud.cloud/_next/static/media/spotify-logo.0227291e.svg',
    logoAlt: 'Spotify',
    title: 'Pitch your track to Spotify',
    description:
      "Use Spotify for Artists to pitch an upcoming, unreleased song to their playlist editors. Pitching your song will also make it eligible to your followers\u2019 Release Radar playlists.",
    eligibilityRequirements: [
      { text: 'You can only pitch one track per release.' },
    ],
    buttonLabel: 'Visit Page',
    visitUrl: 'https://artists.spotify.com',
  },
  {
    id: 'amazon',
    logoSrc:
      'https://assets.web.soundcloud.cloud/_next/static/media/amazon-music-logo.bd0fd708.svg',
    logoAlt: 'Amazon Music',
    title: 'Pitch your track to Amazon Music',
    description:
      'Use Amazon Music for Artists to pitch a new song to their playlist editors. You can pitch up to 14 days past release.',
    eligibilityRequirements: [
      { text: 'You can only pitch one track per release.' },
      {
        text: 'If you do not have access to AMFA, you must first claim your account.',
      },
    ],
    buttonLabel: 'Visit Page',
    visitUrl: 'https://artists.amazonmusic.com',
  },
  {
    id: 'groover',
    logoSrc:
      'https://assets.web.soundcloud.cloud/_next/static/media/groover-logo.2a08d0ea.png',
    logoAlt: 'Groover',
    title: 'Groover',
    description:
      'Promote your music, get listened to and receive GUARANTEED feedback. Groover connects artists who want to promote their music with the best curators, radios and labels seeking emerging talents.',
    extraText:
      'With SoundCloud Artist Pro, you get 20% off your first Groover campaign and a free Hype add-on.',
    buttonLabel: 'Get Started',
    visitUrl: 'https://groover.co/en/blog/groover-soundcloud-artist-pro/',
  },
];

interface IPromotionCardProps {
  card: IPromotionCard;
}

function PromotionCard({ card }: IPromotionCardProps) {
  return (
    <a
      href={card.visitUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-colors duration-200 hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      aria-label={`${card.title} — ${card.buttonLabel}`}
    >
      {/* ── Logo area ──
          Matches the original markup exactly:
          position:absolute inset:0 aspect-ratio:16/9
          object-fit:scale-down height:80% width:auto margin:auto
      -->*/}
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={card.logoSrc}
          alt=""
          role="presentation"
          draggable={false}
          className="absolute inset-0 m-auto object-scale-down transition-transform duration-300 group-hover:scale-110"
          //style={{ height: '80%', width: 'auto' }}
          style={{ width: '284.44px', height: '160px' }}
        />
      </div>

      {/* ── Text area ── */}
      <div className="flex flex-col gap-3 px-6 pt-4 pb-4">
        <div>
          <h3 className="text-white text-base font-bold mb-2">{card.title}</h3>
          <p className="text-[#ccc] text-sm leading-relaxed">{card.description}</p>
        </div>

        {card.eligibilityRequirements && card.eligibilityRequirements.length > 0 && (
          <div>
            <p className="text-white text-sm font-bold mb-2">Eligibility requirements</p>
            <ul className="flex flex-col gap-1">
              {card.eligibilityRequirements.map((req) => (
                <li key={req.text} className="flex items-start gap-2 text-[#ccc] text-sm">
                  <span className="text-white font-bold mt-0.5 shrink-0" aria-hidden="true">
                    ✦
                  </span>
                  <span>{req.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {card.extraText && (
          <p className="text-[#ccc] text-sm leading-relaxed">{card.extraText}</p>
        )}
      </div>

      {/* ── Button ── */}
      <div className="px-6 pb-6 mt-auto pt-2">
        <span className="inline-flex items-center justify-center w-full py-3 rounded-full border-2 border-white text-white text-sm font-bold transition-colors duration-150 group-hover:bg-white group-hover:text-black">
          {card.buttonLabel}
        </span>
      </div>
    </a>
  );
}

export default function StudioPromotionsTab() {
  return (
    <div className="grid grid-cols-3 gap-4 py-2">
      {PROMOTION_CARDS.map((card) => (
        <PromotionCard key={card.id} card={card} />
      ))}
    </div>
  );
}
