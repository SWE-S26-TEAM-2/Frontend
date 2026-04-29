"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { IMenuItem } from "@/types/ui.types";
import { useAuthStore } from "@/store/authStore";
import KeyboardShortcutsModal from "@/components/KeyboardShortcutsModal/KeyboardShortcutsModal";
import { clearAuthCookie } from "@/lib/authCookie";

// ── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2.25a7.75 7.75 0 1 0 4.924 13.735l5.546 5.545 1.06-1.06-5.545-5.546A7.75 7.75 0 0 0 10 2.25ZM3.75 10a6.25 6.25 0 1 1 12.5 0 6.25 6.25 0 0 1-12.5 0Z" />
  </svg>
);
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
    <path d="M19.681 7h.069v-.875c0-2.111-1.65-3.875-3.75-3.875s-3.75 1.764-3.75 3.875V7h.069a9.39 9.39 0 00-5.68 7.919l-.272 3.533a2.693 2.693 0 01-1.003 1.896c-1.824 1.46-.792 4.402 1.544 4.402h4.357v.043c-.023 2.686 2.056 4.934 4.708 4.957 2.651.022 4.768-2.19 4.791-4.876l.001-.124h4.327c2.336 0 3.368-2.942 1.544-4.402a2.694 2.694 0 01-1.003-1.896l-.272-3.533A9.39 9.39 0 0019.681 7zm-1.431-.478A9.402 9.402 0 0016 6.25c-.774 0-1.528.094-2.25.272v-.397c0-1.34 1.036-2.375 2.25-2.375s2.25 1.034 2.25 2.375v.397zM16 7.75a7.89 7.89 0 017.866 7.284l.272 3.533a4.193 4.193 0 001.561 2.953c.717.573.311 1.73-.607 1.73H6.908c-.918 0-1.324-1.157-.607-1.73a4.193 4.193 0 001.561-2.953l.272-3.533A7.889 7.889 0 0116 7.75zm-3.235 17h6.5v.11c-.017 1.917-1.513 3.405-3.28 3.39-1.766-.015-3.237-1.528-3.22-3.444v-.056z" />
  </svg>
);
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
    <path d="M2 10C2 7.79086 3.79086 6 6 6H26C28.2091 6 30 7.79086 30 10V22C30 24.2091 28.2091 26 26 26H6C3.79086 26 2 24.2091 2 22V10ZM6 7.5C4.80376 7.5 3.80375 8.34018 3.55789 9.46263L16 17.1193L28.4421 9.46264C28.1963 8.34018 27.1962 7.5 26 7.5H6ZM3.5 11.1883V22C3.5 23.3807 4.61929 24.5 6 24.5H26C27.3807 24.5 28.5 23.3807 28.5 22V11.1883L16 18.8806L3.5 11.1883Z" />
  </svg>
);
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.5303 9.53033L12 18.0607L3.46967 9.53033L4.53033 8.46967L12 15.9393L19.4697 8.46967L20.5303 9.53033Z" />
  </svg>
);
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 8c0-.832-.67-1.5-1.511-1.5C1.67 6.5 1 7.168 1 8s.67 1.5 1.489 1.5C3.33 9.5 4 8.832 4 8zm5.5 0c0-.832-.67-1.5-1.504-1.5C7.17 6.5 6.5 7.168 6.5 8s.67 1.5 1.496 1.5C8.831 9.5 9.5 8.832 9.5 8zM15 8c0-.832-.664-1.5-1.493-1.5C12.664 6.5 12 7.168 12 8s.664 1.5 1.507 1.5C14.336 9.5 15 8.832 15 8z" />
  </svg>
);
const SoundCloudLogo = () => (
  <svg viewBox="-2 0 32 32" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg" aria-label="SoundCloud">
    <path d="M23.2 22.68h-10.12c-0.28 0-0.56-0.16-0.72-0.4-0.080-0.12-0.12-0.32-0.12-0.48v-10.76c0-0.28 0.16-0.56 0.4-0.72 1.040-0.64 2.28-1 3.52-1 2.92 0 5.48 1.88 6.36 4.64 0.24-0.040 0.48-0.080 0.72-0.080 2.4 0 4.4 1.96 4.4 4.4s-2.040 4.4-4.44 4.4zM13.92 20.96h9.28c1.48 0 2.68-1.2 2.68-2.68s-1.2-2.68-2.68-2.68c-0.36 0-0.72 0.080-1.040 0.2-0.24 0.080-0.52 0.080-0.72-0.040-0.24-0.12-0.4-0.36-0.44-0.6-0.4-2.4-2.48-4.12-4.88-4.12-0.76 0-1.52 0.16-2.2 0.52v9.4zM10.84 21.8v-8.68c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v8.72c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM7.8 21.8v-9c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v9.040c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM4.76 21.8v-6.48c0-0.48-0.4-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v6.52c0 0.48 0.4 0.84 0.84 0.84s0.84-0.4 0.84-0.88zM1.72 21.32v-5.32c0-0.48-0.4-0.84-0.84-0.84s-0.88 0.36-0.88 0.84v5.32c0 0.48 0.4 0.84 0.84 0.84s0.88-0.36 0.88-0.84z" />
  </svg>
);
const HamburgerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
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

const NAV_ITEMS = [
  { label: "Home",    href: "/discover" },
  { label: "Feed",    href: "/stream" },
  { label: "Library", href: "/library" },
];

const ArtistProBadge = () => (
  <span className="w-[15px] h-[15px] rounded-full bg-[#FF5500] inline-flex items-center justify-center text-[10px] text-white font-bold">★</span>
);

const getAvatarMenu = (profileHref: string): IMenuItem[] => {
  const profileLikesHref = profileHref === "/" ? "/likes" : `${profileHref}/likes`;

  return [
    { icon: <ProfileIcon />,     label: "Profile",        href: profileHref },
    { icon: <LikesIcon />,       label: "Likes",          href: profileLikesHref },
    { icon: <StationsIcon />,    label: "Stations",       href: "/stream" },
    { icon: <WhoToFollowIcon />, label: "Who to follow",  href: "/who-to-follow", dividerBefore: true },
    { icon: <ArtistProBadge />,  label: "Try Artist Pro", href: "/artist-pro", orange: true },
    { icon: <TracksIcon />,      label: "Tracks",         href: "/library", dividerBefore: true },
    { icon: <InsightsIcon />,    label: "Dashboard",      href: "/creator/studio" },
    { icon: <SettingsIcon />,    label: "Settings",       href: "/settings" },
    { icon: <StoreIcon />,       label: "Store",          href: "/store" },
    { icon: <DistributeIcon />,  label: "Distribute",     href: "/creator/distribute" },
  ];
};

const DOTS_MENU: IMenuItem[] = [
  { icon: <GlobeIcon />,        label: "About us",           href: "/about" },
  { icon: <GlobeIcon />,        label: "Legal",              href: "/legal" },
  { icon: <GlobeIcon />,        label: "Copyright",          href: "/copyright" },
  { icon: <PhoneIcon />,        label: "Mobile apps",        href: "/mobile",       dividerBefore: true },
  { icon: <GlobeIcon />,        label: "Artist Membership",  href: "/membership" },
  { icon: <NewsroomIcon />,     label: "Newsroom",           href: "/newsroom" },
  { icon: <JobsIcon />,         label: "Jobs",               href: "/jobs" },
  { icon: <DevIcon />,          label: "Developers",         href: "/developers" },
  { icon: <StoreIcon />,        label: "SoundCloud Store",   href: "/store" },
  { icon: <SupportIcon />,      label: "Support",            href: "/support",      dividerBefore: true },
  { icon: <KeyboardIcon />,     label: "Keyboard shortcuts", href: "/shortcuts" },
  { icon: <SubscriptionIcon />, label: "Subscription",       href: "/subscription", dividerBefore: true },
  { icon: <SettingsIcon />,     label: "Settings",           href: "/settings" },
  { icon: <SignOutIcon />,      label: "Sign out",           href: "/" },
];

// ── Dropdown component ────────────────────────────────────────────────────────

function DropdownMenu({ items, onClose }: { items: IMenuItem[]; onClose: () => void }) {
  const itemClass = (orange?: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium w-full bg-transparent border-none cursor-pointer text-left transition-colors hover:bg-[#2a2a2a] no-underline ${
      orange ? "text-[#ff5500]" : "text-[#ddd]"
    }`;

  return (
    <div className="absolute top-[calc(100%+6px)] right-0 bg-[#303030] border border-[#505050] rounded min-w-[200px] z-[999] shadow-[0_8px_24px_rgba(0,0,0,0.5)] overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          {item.dividerBefore && <div className="h-px bg-[#505050]" />}
          {item.noNav ? (
            <button
              onClick={() => { item.onClick?.(); onClose(); }}
              className={itemClass(item.orange)}
            >
              <span className={`flex items-center ${item.orange ? "text-[#ff5500]" : "text-[#aaa]"}`}>{item.icon}</span>
              {item.label}
            </button>
          ) : (
            <Link
              href={item.href}
              onClick={() => { item.onClick?.(); onClose(); }}
              className={itemClass(item.orange)}
            >
              <span className={`flex items-center ${item.orange ? "text-[#ff5500]" : "text-[#aaa]"}`}>{item.icon}</span>
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────

function MobileDrawer({ isOpen, onClose, profileHref, isLoggedIn, onSignOut }: {
  isOpen: boolean;
  onClose: () => void;
  profileHref: string;
  isLoggedIn: boolean;
  onSignOut: () => void;
}) {
  if (!isOpen) return null;
  const linkClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#ddd] hover:bg-[#2a2a2a] no-underline border-none";
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[90]" onClick={onClose} />
      <div className="fixed top-12 left-0 bottom-0 w-64 bg-[#121212] border-r border-[#222] z-[95] overflow-y-auto flex flex-col">
        <nav className="flex flex-col py-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className={linkClass}>{item.label}</Link>
          ))}
          <div className="h-px bg-[#303030] my-1" />
          <Link href="/creator/upload" onClick={onClose} className={linkClass}>Upload</Link>
          <Link href="/creator/studio" onClick={onClose} className={linkClass}>For Artists</Link>
          {isLoggedIn && (
            <>
              <div className="h-px bg-[#303030] my-1" />
              <Link href={profileHref} onClick={onClose} className={linkClass}>Profile</Link>
              <Link href={profileHref === "/" ? "/likes" : `${profileHref}/likes`} onClick={onClose} className={linkClass}>Likes</Link>
              <Link href="/creator/studio" onClick={onClose} className={linkClass}>Dashboard</Link>
              <Link href="/notifications" onClick={onClose} className={linkClass}>Notifications</Link>
              <Link href="/messages" onClick={onClose} className={linkClass}>Messages</Link>
              <Link href="/settings" onClick={onClose} className={linkClass}>Settings</Link>
              <Link href="/store" onClick={onClose} className={linkClass}>Store</Link>
              <div className="h-px bg-[#303030] my-1" />
              <button onClick={() => { onSignOut(); onClose(); }} className={`${linkClass} text-[#ff5500] w-full text-left`}>Sign out</button>
            </>
          )}
          {!isLoggedIn && (
            <>
              <div className="h-px bg-[#303030] my-1" />
              <Link href="/login" onClick={onClose} className={linkClass}>Sign in</Link>
              <Link href="/login" onClick={onClose} className={`${linkClass} text-[#ff5500]`}>Create account</Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}

// ── Header component ──────────────────────────────────────────────────────────

export default function Header({ isLoggedIn: isLoggedInProp }: { isLoggedIn?: boolean }) {
  const [query, setQuery]                   = useState("");
  const [avatarOpen, setAvatarOpen]         = useState(false);
  const [dotsOpen, setDotsOpen]             = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [hasToken, setHasToken]             = useState(false);
  const [storedUserId, setStoredUserId]     = useState<string | null>(null);
  const [storedUsername, setStoredUsername] = useState<string | null>(null);
  const [storedAvatarUrl, setStoredAvatarUrl] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen]   = useState(false);
  const [avatarError, setAvatarError]       = useState(false);

  const authUser        = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeLogin      = useAuthStore((state) => state.login);
  const logout          = useAuthStore((state) => state.logout);
  const router          = useRouter();
  const pathname        = usePathname();

  useEffect(() => {
    const token      = window.localStorage.getItem("auth_token");
    const userId     = window.localStorage.getItem("auth_user_id");
    const uname      = window.localStorage.getItem("auth_username");
    const savedImage = window.localStorage.getItem("auth_profile_image");
    if (token)      setHasToken(true);
    if (userId)     setStoredUserId(userId);
    if (uname)      setStoredUsername(uname);
    if (savedImage) setStoredAvatarUrl(savedImage);
    if (!token) return;

    if (isAuthenticated && authUser?.profileImageUrl) return;

    import("@/services").then(({ AuthService: authService }) => {
      authService.getCurrentUser(token)
        .then((user) => {
          storeLogin(user, token);
          if (user.profileImageUrl) setStoredAvatarUrl(user.profileImageUrl);
        })
        .catch(() => {
          window.localStorage.removeItem("auth_token");
          window.localStorage.removeItem("refresh_token");
          window.localStorage.removeItem("auth_user_id");
          window.localStorage.removeItem("auth_username");
          clearAuthCookie();
          setHasToken(false);
          setStoredUserId(null);
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authUser?.profileImageUrl]);

  const isLoggedIn = isLoggedInProp !== undefined ? isLoggedInProp : (isAuthenticated || hasToken);

  const avatarSrc = (() => {
    const raw = (authUser?.profileImageUrl ?? storedAvatarUrl ?? "").trim();
    if (!raw) return null;
    const isHttp = raw.startsWith("http://") || raw.startsWith("https://");
    const isData = raw.startsWith("data:");
    const isKnownUploadPath = raw.startsWith("/api/uploads/") || raw.startsWith("/uploads/");
    const hasImageExt = /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(raw);
    const looksLikeUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw) ||
      (raw.startsWith("/") && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw.slice(1)));
    if (looksLikeUuid || raw === String(authUser?.id ?? "")) return null;
    if (isHttp) {
      if (hasImageExt || /googleusercontent|gravatar|pravatar|cloudinary|imgur|duckdns/i.test(raw)) return raw;
      return null;
    }
    if (isData || isKnownUploadPath || hasImageExt) return raw.startsWith("/") || isData ? raw : `/${raw}`;
    return null;
  })();

  useEffect(() => { setAvatarError(false); }, [avatarSrc]);

  const avatarRef  = useRef<HTMLDivElement>(null);
  const dotsRef    = useRef<HTMLDivElement>(null);
  const profileHref = authUser?.username
    ? `/${authUser.username}`
    : storedUsername
      ? `/${storedUsername}`
      : storedUserId
        ? `/${storedUserId}`
        : "/";

  const handleSignOut = () => {
    logout();
    window.localStorage.removeItem("auth_token");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("auth_user_id");
    window.localStorage.removeItem("auth_username");
    window.localStorage.removeItem("auth_profile_image");
    clearAuthCookie();
    setHasToken(false);
    setStoredUserId(null);
    setStoredUsername(null);
    setStoredAvatarUrl(null);
    router.push("/login");
  };

  const dotsMenu = DOTS_MENU.map((item) => {
    if (item.label === "Sign out")           return { ...item, onClick: handleSignOut };
    if (item.label === "Keyboard shortcuts") return { ...item, noNav: true, onClick: () => setShortcutsOpen(true) };
    return item;
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
      if (dotsRef.current   && !dotsRef.current.contains(e.target as Node))   setDotsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <>
      <header className="bg-[#121212] border-b border-[#121212] h-12 flex items-center px-3 sticky top-0 z-[100]">

        {/* ── LEFT: hamburger (mobile) + logo + nav ── */}
        <div className="flex items-center gap-0 shrink-0">

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 text-[#ccc] hover:text-white transition-colors bg-transparent border-none cursor-pointer mr-1"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 no-underline shrink-0">
            <SoundCloudLogo />
            <span className="text-white text-sm font-bold tracking-tight hidden sm:block select-none">soundcloud</span>
          </Link>

          {/* Nav — hidden on mobile */}
          <nav className="hidden md:flex items-stretch h-12 ml-2" role="navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center px-3 text-[13px] whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "text-white font-semibold border-[#ff5500]"
                      : "text-[#ccc] font-normal border-transparent hover:text-white hover:border-[#ff5500]/40"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── MIDDLE: search bar — grows to fill available space ── */}
        <div className="flex-1 flex items-center justify-center px-3 min-w-0">
          <div className="relative flex items-center w-full max-w-[460px]">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
              aria-label="Search"
              className="w-full h-[30px] bg-[#ffffff1a] border border-[#ffffff26] rounded-[3px] text-white text-[13px] pl-8 pr-3 outline-none placeholder-[#999] transition-colors focus:border-[#999] focus:bg-[#ffffff26]"
            />
            <button
              onClick={handleSearch}
              aria-label="Search"
              className="absolute left-0 h-full px-2.5 flex items-center text-[#aaa] hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* ── RIGHT: actions + user nav ── */}
        <div className="flex items-center gap-0.5 shrink-0">

          {/* Upgrade now — hidden on small screens */}
          <Link
            href="/artist-pro"
            className="hidden lg:flex items-center h-7 px-3 text-[#ff5500] text-[12px] font-bold border border-[#ff5500] rounded-[3px] no-underline whitespace-nowrap hover:bg-[#ff5500]/10 transition-colors mr-1"
          >
            Upgrade now
          </Link>

          {/* For Artists — hidden on medium and below */}
          <Link
            href="/creator/studio"
            className="hidden lg:block text-[#ccc] text-[13px] no-underline whitespace-nowrap px-2 hover:text-white transition-colors"
          >
            For Artists
          </Link>

          {/* Upload */}
          <Link
            href="/creator/upload"
            className="hidden sm:block text-[#ccc] text-[13px] no-underline whitespace-nowrap px-2 hover:text-white transition-colors"
          >
            Upload
          </Link>

          {isLoggedIn && (
            <>
              {/* Avatar dropdown */}
              <div ref={avatarRef} className="relative flex items-center ml-1">
                <div className="flex items-center gap-0.5">
                  <Link href={profileHref} aria-label="Go to profile" className="flex items-center no-underline">
                    {avatarSrc && !avatarError ? (
                      <Image
                        src={avatarSrc}
                        alt="User avatar"
                        width={26}
                        height={26}
                        className="rounded-full object-cover border border-white/20"
                        unoptimized
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-[26px] h-[26px] rounded-full bg-[#ff5500] flex items-center justify-center text-white text-[11px] font-bold select-none border border-white/20">
                        {(authUser?.username?.[0] ?? "?").toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <button
                    aria-label="Open profile menu"
                    onClick={() => { setAvatarOpen((o) => !o); setDotsOpen(false); }}
                    className="bg-transparent border-none cursor-pointer flex items-center px-0.5 text-[#aaa] hover:text-white transition-colors"
                  >
                    <ChevronDown />
                  </button>
                </div>
                {avatarOpen && <DropdownMenu items={getAvatarMenu(profileHref)} onClose={() => setAvatarOpen(false)} />}
              </div>

              {/* Notifications */}
              <button
                aria-label="Notifications"
                onClick={() => router.push("/notifications")}
                className="bg-transparent border-none cursor-pointer text-[#bbb] flex items-center justify-center w-9 h-9 transition-colors hover:text-white"
              >
                <BellIcon />
              </button>

              {/* Messages */}
              <button
                aria-label="Messages"
                onClick={() => router.push("/messages")}
                className="bg-transparent border-none cursor-pointer text-[#bbb] flex items-center justify-center w-9 h-9 transition-colors hover:text-white"
              >
                <MailIcon />
              </button>

              {/* More (dots) */}
              <div ref={dotsRef} className="relative">
                <button
                  onClick={() => { setDotsOpen((o) => !o); setAvatarOpen(false); }}
                  aria-label="More options"
                  className="bg-transparent border-none cursor-pointer text-[#bbb] flex items-center justify-center w-9 h-9 transition-colors hover:text-white"
                >
                  <DotsIcon />
                </button>
                {dotsOpen && <DropdownMenu items={dotsMenu} onClose={() => setDotsOpen(false)} />}
              </div>
            </>
          )}

          {!isLoggedIn && (
            <div className="flex items-center gap-1.5 ml-1">
              <Link
                href="/login"
                className="text-white no-underline text-[12px] border border-[#ffffff40] rounded-[3px] px-2.5 py-1 leading-none hover:border-[#ffffff80] transition-colors whitespace-nowrap"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="text-[#111] bg-[#ff5500] no-underline text-[12px] rounded-[3px] px-2.5 py-1 leading-none font-semibold hover:bg-[#e64d00] transition-colors whitespace-nowrap hidden sm:block"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        profileHref={profileHref}
        isLoggedIn={isLoggedIn}
        onSignOut={handleSignOut}
      />

      {shortcutsOpen && <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </>
  );
}
