'use client';

import { useRouter } from 'next/navigation';
import type { IStudioStats } from '@/types/studio.types';

interface IStudioStatsBarProps {
  stats: IStudioStats;
}

type StatNumber = {
  value: number;
  label: string;
  metric: string;
};

const STAT_ACTIONS = [
  {
    label: 'Insights',
    navigateTo: '/you/insights?tab=soundcloud&metric=plays',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="13" width="4" height="8" rx="1" />
        <rect x="9" y="8" width="4" height="13" rx="1" />
        <rect x="16" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Earnings',
    navigateTo: null,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12c0-2.5 1.5-4 4-4s4 1.5 4 3-1.5 2.5-4 2.5S8 14.5 8 16s1.5 3 4 3 4-1.5 4-4" />
        <line x1="12" y1="6" x2="12" y2="8" />
        <line x1="12" y1="18" x2="12" y2="20" />
      </svg>
    ),
  },
  {
    label: 'Comments',
    navigateTo: null,
    hasBadge: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="9" y1="13" x2="13" y2="13" />
      </svg>
    ),
  },
  {
    label: 'Fans',
    navigateTo: null,
    hasBadge: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="16" y1="11" x2="22" y2="11" />
      </svg>
    ),
  },
  {
    label: 'Benefits',
    navigateTo: null,
    hasBadge: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
];

export default function StudioStatsBar({ stats }: IStudioStatsBarProps) {
  const router = useRouter();

  const statNumbers: StatNumber[] = [
    { value: stats.scPlays,   label: 'SC plays',   metric: 'plays'     },
    { value: stats.reposts,   label: 'Reposts',    metric: 'reposts'   },
    { value: stats.downloads, label: 'Downloads',  metric: 'downloads' },
    { value: stats.likes,     label: 'Likes',      metric: 'likes'     },
    { value: stats.comments,  label: 'Comments',   metric: 'comments'  },
  ];

  const handleStatClick = (metric: string) => {
    router.push(`/you/insights?tab=soundcloud&metric=${metric}`);
  };

  return (
    <div className="bg-[#181818] border border-[#2a2a2a] rounded-md px-6 py-5">
      {/* Title */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-white text-2xl font-bold">Artist Studio</h2>
        <span className="text-[#999] text-xs">All time stats updated daily.</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center">
        {/* Numeric stats — each is clickable */}
        {statNumbers.map((stat, idx) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => handleStatClick(stat.metric)}
            className={`flex flex-col px-6 text-left hover:opacity-70 transition-opacity ${idx === 0 ? 'pl-0' : 'border-l border-[#2a2a2a]'}`}
          >
            <span className="text-white text-xl font-bold">{stat.value}</span>
            <span className="text-[#999] text-xs mt-0.5">{stat.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="h-10 w-px bg-[#2a2a2a] mx-6 shrink-0" aria-hidden="true" />

        {/* Action icons */}
        <div className="flex items-center gap-8">
          {STAT_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => action.navigateTo ? router.push(action.navigateTo) : undefined}
              disabled={!action.navigateTo}
              className="flex flex-col items-center gap-1 text-white hover:text-[#ccc] transition-colors group disabled:cursor-default disabled:opacity-60"
              aria-label={action.label}
            >
              <div className="relative">
                <span className="text-white group-hover:text-[#ccc] transition-colors">
                  {action.icon}
                </span>
                {action.hasBadge && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f5a623] rounded-full border border-[#181818]"
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