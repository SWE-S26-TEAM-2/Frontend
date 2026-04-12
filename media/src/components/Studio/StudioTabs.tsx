'use client';

export type StudioTab = 'tracks' | 'distribution' | 'vinyl';

interface IStudioTabsProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
}

const TABS: { id: StudioTab; label: string }[] = [
  { id: 'tracks', label: 'SoundCloud Tracks' },
  { id: 'distribution', label: 'Distribution' },
  { id: 'vinyl', label: 'Vinyl Records' },
];

export default function StudioTabs({ activeTab, onTabChange }: IStudioTabsProps) {
  return (
    <div className="border-b border-[#2a2a2a]">
      <nav className="flex" aria-label="Studio tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
            className={`
              px-5 py-3 text-sm font-semibold transition-colors duration-150 border-b-2 -mb-px
              ${activeTab === tab.id
                ? 'text-white border-white'
                : 'text-[#999] border-transparent hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
