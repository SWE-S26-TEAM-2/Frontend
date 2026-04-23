"use client";

type Tab = "tracks" | "people";

interface ISearchTabsProps {
  active: Tab;
  trackCount: number;
  peopleCount: number;
  onTabChange: (tab: Tab) => void;
}

export default function SearchTabs({ active, trackCount, peopleCount, onTabChange }: ISearchTabsProps) {
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "tracks", label: "Tracks", count: trackCount },
    { id: "people", label: "People", count: peopleCount },
  ];

  return (
    <div style={{ display: "flex", borderBottom: "1px solid #222", marginBottom: "24px" }}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: isActive ? "2px solid #f50" : "2px solid transparent",
              color: isActive ? "#fff" : "#888",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: isActive ? 600 : 400,
              padding: "12px 20px",
              marginBottom: "-1px",
              transition: "color 0.15s, border-color 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#ccc"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#888"; }}
          >
            {tab.label}
            <span
              style={{
                background: isActive ? "#f50" : "#333",
                color: isActive ? "#fff" : "#aaa",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: 600,
                padding: "1px 7px",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
