import type { ViewMode } from "@/types/library.types";

// ─── Filter input ─────────────────────────────────────────────────────────────

interface IFilterInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function FilterInput({ value, onChange }: IFilterInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Filter"
      className="bg-transparent border border-[#333] rounded px-3 py-1.5 text-[13px] text-[#aaa] outline-none focus:border-[#555] w-52 placeholder-[#555]"
    />
  );
}

// ─── "All" dropdown ───────────────────────────────────────────────────────────

export function AllDropdown() {
  return (
    <div className="flex items-center gap-1.5 border border-[#333] rounded px-3 py-1.5 text-[13px] text-[#aaa] cursor-pointer hover:border-[#555] transition-colors select-none">
      All
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────

interface IViewToggleProps {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: IViewToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[13px] text-[#aaa] mr-1">View</span>
      <button
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded border-none cursor-pointer transition-colors ${mode === "grid" ? "bg-[#ff5500] text-white" : "bg-transparent text-[#aaa] hover:text-white"}`}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-1.5 rounded border-none cursor-pointer transition-colors ${mode === "list" ? "bg-[#ff5500] text-white" : "bg-transparent text-[#aaa] hover:text-white"}`}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  );
}