'use client';

import { useEffect, useRef } from 'react';

export type SortOption = 'date' | 'plays' | 'duration' | 'likes';

interface IStudioSortDropdownProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClose: () => void;
}

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'date', label: 'Date' },
  { id: 'plays', label: 'Plays' },
  { id: 'duration', label: 'Duration' },
  { id: 'likes', label: 'Likes' },
];

export default function StudioSortDropdown({
  activeSort,
  onSortChange,
  onClose,
}: IStudioSortDropdownProps) {
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
      aria-label="Sort options"
      className="absolute right-0 top-full mt-2 z-50 w-52 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-xl py-2 overflow-hidden"
    >
      <p className="px-4 py-2 text-white text-xs font-bold tracking-widest uppercase">
        Sort by
      </p>
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="menuitem"
          onClick={() => {
            onSortChange(option.id);
            onClose();
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#2a2a2a] transition-colors duration-100"
        >
          <span className={activeSort === option.id ? 'text-white font-bold' : 'text-[#ccc]'}>
            {option.label}
          </span>
          {activeSort === option.id && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
