"use client";

import type { IAdminTab, IAdminSideBarProps } from "@/types/admin.types";

const ADMIN_TABS: { id: IAdminTab; label: string }[] = [
  { id: "analytics", label: "Analytics" },
  { id: "reports",   label: "Reports" },
];

export default function AdminSideBar({ activeTab, onTabChange }: IAdminSideBarProps) {
  return (
    <aside className="w-50 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col p-6 min-h-screen shrink-0">
      <div className="flex items-center gap-2 mb-10">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ff5500">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
        <span className="text-white text-[15px] font-semibold">Admin</span>
      </div>

      <nav className="flex flex-col gap-1">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`text-left px-3 py-2 rounded text-sm cursor-pointer border-none transition-colors ${
              activeTab === tab.id
                ? "bg-[#2a2a2a] text-white font-semibold"
                : "text-[#999999] hover:text-white hover:bg-[#222222] bg-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}