import { ITrack, IDotsMenuItem } from "../../types/trending.types";

export const MOCK_CURATED: ITrack[] = [
  { id: "1", title: "Midnight City", artist: "M83", artworkUrl: "/test.png" },
  { id: "2", title: "Starboy", artist: "The Weeknd", artworkUrl: "/test.png" },
  { id: "3", title: "Nightcall", artist: "Kavinsky", artworkUrl: "/test.png" },
  { id: "4", title: "After Hours", artist: "The Weeknd", artworkUrl: "/test.png" },
  { id: "5", title: "Blinding Lights", artist: "The Weeknd", artworkUrl: "/test.png" },
  { id: "6", title: "Levitating", artist: "Dua Lipa", artworkUrl: "/test.png" },
];

export const MOCK_EMERGING: ITrack[] = [
  { id: "7", title: "New Wave", artist: "Future Artist", artworkUrl: "/test.png" },
  { id: "8", title: "Rising Sun", artist: "Solaris", artworkUrl: "/test.png" },
  { id: "9", title: "Neon Dreams", artist: "Synthwave Kid", artworkUrl: "/test.png" },
  { id: "10", title: "Digital Love", artist: "Daft Punk", artworkUrl: "/test.png" },
  { id: "11", title: "Harder Better", artist: "Daft Punk", artworkUrl: "/test.png" },
];

export const MOCK_POWER: ITrack[] = [
  { id: "12", title: "Power Workout", artist: "SoundCloud", artworkUrl: "/test.png" },
  { id: "13", title: "Focus Flow", artist: "Lo-Fi Beats", artworkUrl: "/test.png" },
  { id: "14", title: "Late Night Drive", artist: "Synth Pop", artworkUrl: "/test.png" },
  { id: "15", title: "Party Anthems", artist: "Various Artists", artworkUrl: "/test.png" },
];

export const DOTS_MENU_DATA: IDotsMenuItem[] = [
  { label: "About us", href: "/about" },
  { label: "Legal", href: "/legal" },
  { label: "Copyright", href: "/copyright" },
  { label: "Mobile apps", href: "/mobile", dividerBefore: true },
  { label: "Artist Membership", href: "/membership" },
  { label: "Newsroom", href: "/newsroom" },
  { label: "Jobs", href: "/jobs" },
  { label: "Developers", href: "/developers" },
  { label: "SoundCloud Store", href: "/store" },
  { label: "Support", href: "/support", dividerBefore: true },
  { label: "Keyboard shortcuts", href: "/shortcuts" },
];