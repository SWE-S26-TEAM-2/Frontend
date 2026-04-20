'use client';

// src/components/Insights/InsightsTimeRangeDropdown.tsx

import { useEffect, useRef } from 'react';
import type { IInsightsTimeRangeDropdown, InsightTimeRange } from '@/types/insights.types';

const OPTIONS: { value: InsightTimeRange; label: string }[] = [
  { value: 'today',   label: 'Today' },
  { value: '7d',      label: 'Last 7 days' },
  { value: '30d',     label: 'Last 30 days' },
  { value: '1y',      label: 'Last 12 months' },
  { value: 'alltime', label: 'All time' },
];

export default function InsightsTimeRangeDropdown({
  activeRange,
  onRangeChange,
  onClose,
}: IInsightsTimeRangeDropdown) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Time range options"
      className="absolute right-0 top-full mt-1 z-50 w-52 bg-[#1a1a1a] border border-[#2a2a2a] shadow-xl py-1 overflow-hidden"
    >
      {OPTIONS.map((option) => {
        const isActive = activeRange === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="menuitem"
            onClick={() => {
              onRangeChange(option.value);
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[#2a2a2a] transition-colors duration-100 text-left"
          >
            <span className={isActive ? 'text-white font-bold' : 'text-[#ccc]'}>
              {option.label}
            </span>
            {isActive && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
