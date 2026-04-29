"use client";

type IFeedFilter = "all" | "tracks" | "reposts";

interface IFeedFilterProps {
  active: IFeedFilter;
  onChange: (filter: IFeedFilter) => void;
}

const TABS: { label: string; value: IFeedFilter }[] = [
  { label: "All activity", value: "all" },
  { label: "Tracks",       value: "tracks" },
  { label: "Reposts",      value: "reposts" },
];

export default function FeedFilter({ active, onChange }: IFeedFilterProps) {
  return (
    <div className="flex gap-0 border-b border-(--sc-border) mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={[
            "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
            active === tab.value
              ? "border-(--sc-orange) text-(--sc-orange)"
              : "border-transparent text-(--sc-text-muted) hover:text-(--sc-text)",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
