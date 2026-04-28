/**
 * navigation.ts — Single source of truth for all header navigation items.
 *
 * ADD A NEW NAV LINK IN ONE PLACE:
 *   1. Add an entry to NAV_ITEMS below.
 *   2. Add the matching SVG icon component to Header.tsx (or a shared icons file).
 *   3. Done — the header, active-state logic, and middleware protection all
 *      pick it up automatically.
 *
 * Fields:
 *   label       — Display text
 *   href        — Exact route path
 *   icon        — Key matching an icon registered in Header's NAV_ICONS map
 *   exact       — If true, active only when pathname === href (default: false,
 *                 meaning active when pathname starts with href)
 *   authRequired — If true, only rendered for logged-in users
 */

export interface INavItem {
  label: string;
  href: string;
  icon: string;
  exact?: boolean;
  authRequired?: boolean;
}

export const NAV_ITEMS: INavItem[] = [
  { label: "Home",      href: "/",          icon: "home",     exact: true },
  { label: "Feed",      href: "/stream",    icon: "feed" },
  { label: "Library",   href: "/library",   icon: "library",  authRequired: true },
  { label: "Messages",  href: "/messages",  icon: "messages", authRequired: true },
  { label: "Playlists", href: "/playlist",  icon: "playlist", authRequired: true },
];
