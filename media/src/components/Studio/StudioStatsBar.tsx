'use client';

import type { IStudioStats } from '@/types/studio.types';

interface IStudioStatsBarProps {
  stats: IStudioStats;
}

const STAT_ACTIONS = [
  {
    label: 'Insights',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Earnings',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M9 9h4.5a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5H14" />
      </svg>
    ),
  },
  {
    label: 'Comments',
    hasBadge: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Fans',
    hasBadge: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Benefits',
    hasBadge: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 12V22H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
];

export default function StudioStatsBar({ stats }: IStudioStatsBarProps) {
  const statNumbers = [
    { value: stats.scPlays, label: 'SC plays' },
    { value: stats.reposts, label: 'Reposts' },
    { value: stats.downloads, label: 'Downloads' },
    { value: stats.likes, label: 'Likes' },
    { value: stats.comments, label: 'Comments' },
  ];

  return (
    <div className="bg-[#181818] border border-[#2a2a2a] rounded-md px-6 py-5">
      {/* Title */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-white text-2xl font-bold">Artist Studio</h2>
        <span className="text-[#999] text-xs">All time stats updated daily.</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-0">
        {/* Numeric stats */}
        {statNumbers.map((stat, idx) => (
          <div
            key={stat.label}
            className={`flex flex-col px-6 ${idx > 0 ? 'border-l border-[#2a2a2a]' : 'pl-0'}`}
          >
            <span className="text-white text-xl font-bold">{stat.value}</span>
            <span className="text-[#999] text-xs mt-0.5">{stat.label}</span>
          </div>
        ))}

        {/* Divider */}
        <div className="h-10 w-px bg-[#2a2a2a] mx-6" aria-hidden="true" />

        {/* Action icons */}
        <div className="flex items-center gap-6">
          {STAT_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex flex-col items-center gap-1 text-white hover:text-[#ccc] transition-colors group"
              aria-label={action.label}
            >
              <div className="relative">
                <span className="text-white group-hover:text-[#ccc] transition-colors">
                  {action.icon}
                </span>
                {action.hasBadge && (
                  <span
                    className="absolute -top-1 -right-1 w-3 h-3 bg-[#f5a623] rounded-full border border-[#181818]"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className="text-[#999] text-[11px]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
