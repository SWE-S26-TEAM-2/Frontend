"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const DotsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);
const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const SoundCloudLogo = () => (
  <svg viewBox="-2 0 32 32" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg" aria-label="SoundCloud">
    <path d="M23.2 22.68h-10.12c-0.28 0-0.56-0.16-0.72-0.4-0.080-0.12-0.12-0.32-0.12-0.48v-10.76c0-0.28 0.16-0.56 0.4-0.72 1.040-0.64 2.28-1 3.52-1 2.92 0 5.48 1.88 6.36 4.64 0.24-0.040 0.48-0.080 0.72-0.080 2.4 0 4.4 1.96 4.4 4.4s-2.040 4.4-4.44 4.4zM13.92 20.96h9.28c1.48 0 2.68-1.2 2.68-2.68s-1.2-2.68-2.68-2.68c-0.36 0-0.72 0.080-1.040 0.2-0.24 0.080-0.52 0.080-0.72-0.040-0.24-0.12-0.4-0.36-0.44-0.6-0.4-2.4-2.48-4.12-4.88-4.12-0.76 0-1.52 0.16-2.2 0.52v9.4zM10.84 21.8v-8.68c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v8.72c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM7.8 21.8v-9c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v9.040c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM4.76 21.8v-6.48c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v6.52c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM1.72 21.32v-5.32c0-0.48-0.4-0.84-0.84-0.84s-0.88 0.36-0.88 0.84v5.32c0 0.48 0.4 0.84 0.84 0.84s0.88-0.36 0.88-0.84z" />
  </svg>
);

// ── Dropdown item icons ───────────────────────────────────────────────────────

const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LikesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const StationsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" /><path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
  </svg>
);
const WhoToFollowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const TracksIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="5" x2="22" y2="5" /><line x1="2" y1="10" x2="22" y2="10" />
    <line x1="2" y1="15" x2="22" y2="15" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const InsightsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const DistributeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);
const NewsroomIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
  </svg>
);
const JobsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const DevIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const StoreIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const SupportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const KeyboardIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
  </svg>
);
const SubscriptionIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const SignOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────

type IMenuItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  orange?: boolean;
  dividerBefore?: boolean;
};

const NAV_ITEMS = [
  { label: "Home",    href: "/" },
  { label: "Feed",    href: "/feed" },
  { label: "Library", href: "/library" },
];

const AVATAR_MENU: IMenuItem[] = [
  { icon: <ProfileIcon />,     label: "Profile",        href: "/profile" },
  { icon: <LikesIcon />,       label: "Likes",          href: "/likes" },
  { icon: <StationsIcon />,    label: "Stations",       href: "/stations" },
  { icon: <WhoToFollowIcon />, label: "Who to follow",  href: "/who-to-follow", dividerBefore: true },
  { icon: <span style={{ width: 15, height: 15, borderRadius: "50%", background: "#FF5500", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>★</span>, label: "Try Artist Pro", href: "/artist-pro", orange: true },
  { icon: <TracksIcon />,      label: "Tracks",         href: "/tracks",      dividerBefore: true },
  { icon: <InsightsIcon />,    label: "Insights",       href: "/insights" },
  { icon: <DistributeIcon />,  label: "Distribute",     href: "/distribute" },
];

const DOTS_MENU: IMenuItem[] = [

  { icon: <GlobeIcon />,        label: "About us",          href: "/about" },
  { icon: <GlobeIcon />,        label: "Legal",             href: "/legal" },
  { icon: <GlobeIcon />,        label: "Copyright",         href: "/copyright" },
  { icon: <PhoneIcon />,        label: "Mobile apps",       href: "/mobile",        dividerBefore: true },
  { icon: <GlobeIcon />,        label: "Artist Membership", href: "/membership" },
  { icon: <NewsroomIcon />,     label: "Newsroom",          href: "/newsroom" },
  { icon: <JobsIcon />,         label: "Jobs",              href: "/jobs" },
  { icon: <DevIcon />,          label: "Developers",        href: "/developers" },
  { icon: <StoreIcon />,        label: "SoundCloud Store",  href: "/store" },
  { icon: <SupportIcon />,      label: "Support",           href: "/support",       dividerBefore: true },
  { icon: <KeyboardIcon />,     label: "Keyboard shortcuts",href: "/shortcuts" },
  { icon: <SubscriptionIcon />, label: "Subscription",      href: "/subscription",  dividerBefore: true },
  { icon: <SettingsIcon />,     label: "Settings",          href: "/settings" },
  { icon: <SignOutIcon />,      label: "Sign out",          href: "/signout" },
];

// ── Shared styles ─────────────────────────────────────────────────────────────

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#999",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  transition: "color 0.15s",
  flexShrink: 0,
  position: "relative",
};

// ── Dropdown component ────────────────────────────────────────────────────────

function DropdownMenu({
  items,
  onClose,
}: {
  items: IMenuItem[];
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        background: "rgba(48, 48, 48)",
        border: "1px solid rgba(80, 80, 80)",
        borderRadius: "4px",
        minWidth: "200px",
        zIndex: 999,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.dividerBefore && (
            <div style={{ height: "1px", background: "rgba(80, 80, 80)", margin: "0" }} />
          )}
          <Link
            href={item.href}
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              color: item.orange ? "#f50" : "#ddd",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a2a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ color: item.orange ? "#f50" : "#aaa", display: "flex", alignItems: "center" }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
}

// ── Header component ──────────────────────────────────────────────────────────

export default function Header({
  avatarUrl = "https://i.pravatar.cc/32",
  isLoggedIn = true,
}: {
  avatarUrl?: string;
  isLoggedIn?: boolean;
}) {
  const [query, setQuery]             = useState("");
  const [activeNav, setActiveNav]     = useState("Home");
  const [isAvatarOpen, setIsAvatarOpen]   = useState(false);
  const [isDotsOpen, setIsDotsOpen]       = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const dotsRef   = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setIsAvatarOpen(false);
      if (dotsRef.current   && !dotsRef.current.contains(e.target as Node))   setIsDotsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      style={{
        background: "rgba(18, 18, 18)",
        borderBottom: "1px solid rgba(18,18,18)",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%", maxWidth: "1280px" }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0, marginRight: "4px" }}>
          <SoundCloudLogo />
          <span style={{ color: "white", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.3px" }}>
            soundcloud
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "stretch", height: "48px", flexShrink: 0 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setActiveNav(item.label)}
                style={{
                  color: isActive ? "#fff" : "#aaa",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: isActive ? 600 : 400,
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  borderBottom: isActive ? "0.5px solid #fff" : "2px solid transparent",
                  transition: "color 0.15s, border-color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <span style={{ position: "absolute", left: "10px", color: "#777", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "200px",
              height: "30px",
              background: "#2a2a2a",
              border: "1px solid #3a3a3a",
              borderRadius: "3px",
              color: "#fff",
              fontSize: "14px",
              paddingLeft: "32px",
              paddingRight: "10px",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#666")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#3a3a3a")}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Try Artist Pro */}
        <Link href="/artist-pro" style={{ color: "#f50", fontSize: "14px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", padding: "0 6px", flexShrink: 0 }}>
          Try Artist Pro
        </Link>

        {/* For Artists */}
        <Link href="/for-artists"
          style={{ color: "#ccc", fontSize: "14px", textDecoration: "none", whiteSpace: "nowrap", padding: "0 6px", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
        >
          For Artists
        </Link>

        {/* Upload */}
        <Link href="/upload"
          style={{ color: "#ccc", fontSize: "14px", textDecoration: "none", whiteSpace: "nowrap", padding: "0 6px", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
        >
          Upload
        </Link>

        {/* Divider */}
        <div style={{ width: "1px", height: "20px", background: "rgba(80, 80, 80)", margin: "0 4px", flexShrink: 0 }} />

        {isLoggedIn && (
          <>
            {/* Avatar dropdown */}
            <div ref={avatarRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => { setIsAvatarOpen((o) => !o); setIsDotsOpen(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "0 4px" }}
              >
                <Image src={avatarUrl} alt="User avatar" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ color: "#888" }}><ChevronDown /></span>
              </button>
              {isAvatarOpen && <DropdownMenu items={AVATAR_MENU} onClose={() => setIsAvatarOpen(false)} />}
            </div>

            {/* Bell */}
            <button style={iconBtnStyle} aria-label="Notifications"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              <BellIcon />
            </button>

            {/* Mail */}
            <button style={iconBtnStyle} aria-label="Messages"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              <MailIcon />
            </button>

            {/* Dots dropdown */}
            <div ref={dotsRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => { setIsDotsOpen((o) => !o); setIsAvatarOpen(false); }}
                style={{ ...iconBtnStyle }}
                aria-label="More options"
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
              >
                <DotsIcon />
              </button>
              {isDotsOpen && <DropdownMenu items={DOTS_MENU} onClose={() => setIsDotsOpen(false)} />}
            </div>
          </>
        )}
      </div>
    </header>
  );
} 