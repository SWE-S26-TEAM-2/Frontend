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
    <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);
const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
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

const NAV_ITEMS = [
  { label: "Stream",   href: "/stream" },
  { label: "Discover", href: "/discover" },
  { label: "Library",  href: "/library" },
];

const ArtistProBadge = () => (
  <span className="w-[15px] h-[15px] rounded-full bg-[#FF5500] inline-flex items-center justify-center text-[10px] text-white font-bold">★</span>
);

const getAvatarMenu = (profileHref: string): IMenuItem[] => [
  { icon: <ProfileIcon />,     label: "Profile",        href: profileHref },
  { icon: <LikesIcon />,       label: "Likes",          href: "/likes" },
  { icon: <StationsIcon />,    label: "Stations",       href: "/stations" },
  { icon: <WhoToFollowIcon />, label: "Who to follow",  href: "/who-to-follow", dividerBefore: true },
  { icon: <ArtistProBadge />,  label: "Try Artist Pro", href: "/artist-pro", orange: true },
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
  { icon: <SignOutIcon />,      label: "Sign out",          href: "/" },
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
              <span className={`flex items-center ${item.orange ? "text-[#ff5500]" : "text-[#aaa]"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ) : (
            <Link
              href={item.href}
              onClick={() => { item.onClick?.(); onClose(); }}
              className={itemClass(item.orange)}
            >
              <span className={`flex items-center ${item.orange ? "text-[#ff5500]" : "text-[#aaa]"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Header component ──────────────────────────────────────────────────────────

export default function Header({ isLoggedIn: isLoggedInProp }: { isLoggedIn?: boolean }) {
  const [query, setQuery]               = useState("");
  const [avatarOpen, setAvatarOpen]     = useState(false);
  const [dotsOpen, setDotsOpen]         = useState(false);
  const [hasToken, setHasToken]         = useState(false);
  const [storedUserId, setStoredUserId] = useState<string | null>(null);
  const [storedUsername, setStoredUsername] = useState<string | null>(null);
  const [storedAvatarUrl, setStoredAvatarUrl] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [avatarError, setAvatarError]   = useState(false);

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
    // isHttp must be checked before hasImageExt — otherwise https:// URLs get a "/" prepended
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
  const profileHref = authUser?.username ? `/${authUser.username}` : storedUsername ? `/${storedUsername}` : "/";

  const handleSignOut = () => {
    logout();
    window.localStorage.removeItem("auth_token");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("auth_user_id");
    window.localStorage.removeItem("auth_username");
    clearAuthCookie();
    setHasToken(false);
    setStoredUserId(null);
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

  return (
    <>
      <header className="bg-[#121212] border-b border-[#121212] h-12 flex items-center justify-center px-4 sticky top-0 z-[100]">
        <div className="flex items-center gap-1 w-full max-w-[1280px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0 mr-1">
            <SoundCloudLogo />
            <span className="text-white text-base font-bold tracking-tight">soundcloud</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-stretch h-12 shrink-0">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center px-2.5 text-[15px] whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "text-white font-semibold border-white"
                      : "text-[#aaa] font-normal border-transparent hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <div className="relative flex items-center shrink-0 ml-1">
            <span className="absolute left-2.5 text-[#777] flex items-center pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  setQuery("");
                }
              }}
              className="w-[200px] h-[30px] bg-[#2a2a2a] border border-[#3a3a3a] rounded-[3px] text-white text-sm pl-8 pr-2.5 outline-none transition-colors focus:border-[#666]"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Try Artist Pro */}
          <Link href="/artist-pro" className="text-[#ff5500] text-sm font-bold no-underline whitespace-nowrap px-1.5 shrink-0">
            Try Artist Pro
          </Link>

          {/* For Artists */}
          <Link href="/for-artists" className="text-[#ccc] text-sm no-underline whitespace-nowrap px-1.5 shrink-0 hover:text-white transition-colors">
            For Artists
          </Link>

          {/* Upload */}
          <Link href="/creator/upload" className="text-[#ccc] text-sm no-underline whitespace-nowrap px-1.5 shrink-0 hover:text-white transition-colors">
            Upload
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-[#505050] mx-1 shrink-0" />

          {isLoggedIn && (
            <>
              {/* Avatar dropdown */}
              <div ref={avatarRef} className="relative shrink-0">
                <div className="flex items-center gap-1">
                  <Link href={profileHref} aria-label="Go to profile" className="flex items-center no-underline">
                    {avatarSrc && !avatarError ? (
                      <Image
                        src={avatarSrc}
                        alt="User avatar"
                        width={28}
                        height={28}
                        className="rounded-full object-cover"
                        unoptimized
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#ff5500] flex items-center justify-center text-white text-xs font-bold select-none">
                        {(authUser?.username?.[0] ?? "?").toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <button
                    aria-label="Open profile menu"
                    onClick={() => { setAvatarOpen((o) => !o); setDotsOpen(false); }}
                    className="bg-transparent border-none cursor-pointer flex items-center px-0.5"
                  >
                    <span className="text-[#888]"><ChevronDown /></span>
                  </button>
                </div>
                {avatarOpen && <DropdownMenu items={getAvatarMenu(profileHref)} onClose={() => setAvatarOpen(false)} />}
              </div>

              {/* Bell */}
              <button
                aria-label="Notifications"
                onClick={() => router.push("/notifications")}
                className="bg-transparent border-none cursor-pointer text-[#999] flex items-center justify-center p-1 transition-colors shrink-0 hover:text-white"
              >
                <BellIcon />
              </button>

              {/* Mail */}
              <button
                aria-label="Messages"
                onClick={() => router.push("/messages")}
                className="bg-transparent border-none cursor-pointer text-[#999] flex items-center justify-center p-1 transition-colors shrink-0 hover:text-white"
              >
                <MailIcon />
              </button>

              {/* Dots dropdown */}
              <div ref={dotsRef} className="relative shrink-0">
                <button
                  onClick={() => { setDotsOpen((o) => !o); setAvatarOpen(false); }}
                  aria-label="More options"
                  className="bg-transparent border-none cursor-pointer text-[#999] flex items-center justify-center p-1 transition-colors hover:text-white"
                >
                  <DotsIcon />
                </button>
                {dotsOpen && <DropdownMenu items={dotsMenu} onClose={() => setDotsOpen(false)} />}
              </div>
            </>
          )}

          {!isLoggedIn && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="text-white no-underline text-[13px] border border-[#3a3a3a] rounded-[3px] px-2.5 py-1.5 leading-none hover:border-[#666] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="text-[#111] bg-white no-underline text-[13px] rounded-[3px] px-2.5 py-1.5 leading-none font-semibold hover:bg-gray-200 transition-colors"
              >
                Create account
              </Link>
            </div>
          )}

        </div>
      </header>

      {shortcutsOpen && <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />}
    </>
  );
}
