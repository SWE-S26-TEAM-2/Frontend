// src/app/[username]/components/Icons.tsx

import { formatNumber } from "@/utils/formatNumber";

// ── HeartIcon 
export const HeartIcon = ({ isFilled }: { isFilled: boolean }) => (
  <svg
    width={14} height={14} viewBox="0 0 24 24"
    fill={isFilled ? "#ff5500" : "none"}
    stroke={isFilled ? "#ff5500" : "currentColor"}
    strokeWidth={2}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export const RepostIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

// ── ShareIcon
export const ShareIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);

export const CopyIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

export const MoreIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <circle cx="19" cy="12" r="2"/>
  </svg>
);

// ── IconBtn — 
export interface IIconBtnProps {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

export function IconBtn({ icon, label, active = false, count, onClick }: IIconBtnProps) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 5,
      background: active ? "#ff550015" : "transparent",
      border: `1px solid ${active ? "#ff5500" : "#2e2e2e"}`,
      color: active ? "#ff5500" : "#888",
      borderRadius: 3, padding: "5px 11px",
      cursor: "pointer", fontSize: 12, fontFamily: "inherit",
    }}>
      {icon}
      {count !== undefined && <span style={{ fontWeight: 600 }}>{formatNumber(count)}</span>}
      {label && <span>{label}</span>}
    </button>
  );
}